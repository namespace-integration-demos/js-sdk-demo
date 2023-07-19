import * as fs from "fs/promises";
import * as path from "path";

import { createPromiseClient, Interceptor } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-node";

import { CreateInstanceRequest_Feature } from "@buf/namespace_cloud.bufbuild_es/namespace/cloud/compute/v1beta/compute_pb.js";
import { ComputeService } from "@buf/namespace_cloud.bufbuild_connect-es/namespace/cloud/compute/v1beta/compute_connect.js";

void main();

async function main() {
	const token = await readLocalToken();

	// Configure client stub.
	const transport = createConnectTransport({
		httpVersion: "1.1",
		// fra1 is the default Compute region (Frankfurt).
		baseUrl: "https://fra1.compute.namespaceapis.com",
		// Use JSON on the wire instead of binary Protobufs.
		useBinaryFormat: false,
		// Pass Authorization header with all requests.
		interceptors: [bearerAuthInterceptor(token)],
	});
	const client = createPromiseClient(ComputeService, transport);

	// Create instance.
	const resp = await client.createInstance({
		shape: { virtualCpu: 2, memoryMegabytes: 4096 },
		// By default the VM is created with only containerd in it and not K8s.
		features: [CreateInstanceRequest_Feature.KUBERNETES],
	});
	const instanceId = resp.metadata.instanceId;

	console.log("Kubernetes Cluster created.");
	console.log("   - ID:  ", instanceId);
	console.log("   - URL: ", resp.instanceUrl);
	console.log();

	// Wait for the instance to boot up and K8s to initialize.
	console.log("Waiting for the cluster to initialize...");
	const waitStream = client.waitInstance({ instanceId });
	for await (const _ of waitStream);
	console.log("   - cluster initialized.");

	// Get kubeconfig.
	console.log();
	console.log("Getting kubeconfig.yaml...");
	const kubeconfig = await client.getKubernetesConfig({ instanceId });
	const kubeconfigPath = `${instanceId}.yaml`;
	await fs.writeFile(kubeconfigPath, kubeconfig.kubeconfig);
	console.log("   - got: ", kubeconfigPath);

	console.log();
	console.log("Try:");
	console.log(`   $ kubectl --kubeconfig=${kubeconfigPath} get all`);

	if (false) {
		await client.destroyInstance({
			instanceId,
			reason: "testing",
		});
		console.log("Kubernetes Cluster destroyed");
	}
}

function bearerAuthInterceptor(token: string): Interceptor {
	return (next) => async (req) => {
		req.header.append("Authorization", `Bearer ${token}`);
		return await next(req);
	};
}

async function readLocalToken() {
	const tokenPath = path.join(userConfigDir(), "ns/token.json");
	const tokenBytes = await fs.readFile(tokenPath, { encoding: "utf8" });
	const tokenData = JSON.parse(tokenBytes) as { bearer_token: string };
	return tokenData.bearer_token;
}

function userConfigDir() {
	if (process.platform === "darwin")
		return path.join(process.env.HOME + "/Library/Application Support");
	return path.join(process.env.HOME, ".config");
}

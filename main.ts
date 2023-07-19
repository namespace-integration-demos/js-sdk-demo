import { createPromiseClient, Interceptor } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-node";
import { CreateInstanceRequest_Feature } from "@buf/namespace_cloud.bufbuild_es/namespace/cloud/compute/v1beta/compute_pb.js";
import { ComputeService } from "@buf/namespace_cloud.bufbuild_connect-es/namespace/cloud/compute/v1beta/compute_connect.js";
import * as fs from "fs/promises";

function bearerAuth(token: string): Interceptor {
  return (next) => async (req) => {
    req.header.append("Authorization", `Bearer ${token}`);
    return await next(req);
  };
}

async function main() {
  const tokenBytes = await fs.readFile(
    `${process.env.HOME}/Library/Application Support/ns/token.json`,
    { encoding: "utf8" }
  );

  const tokenJSON = JSON.parse(tokenBytes);
  const token = tokenJSON.bearer_token;

  const transport = createConnectTransport({
    httpVersion: "1.1",
    baseUrl: "https://fra1.compute.namespaceapis.com",
    useBinaryFormat: false,
    interceptors: [bearerAuth(token)],
  });

  const client = createPromiseClient(ComputeService, transport);
  const resp = await client.createInstance({
    shape: {
      virtualCpu: 2,
      memoryMegabytes: 4096,
    },
    features: [CreateInstanceRequest_Feature.KUBERNETES],
  });
  const instanceId = resp.metadata.instanceId;

  console.log("Kubernetes Cluster created.");
  console.log("  ID:  ", instanceId);
  console.log("  URL: ", resp.instanceUrl);
  console.log();

  console.log("Waiting for the cluster to initialize...");
  const waitStream = client.waitInstance({ instanceId });
  for await (const _ of waitStream);
  console.log("Cluster initialized.");

  const kubeconfig = await client.getKubernetesConfig({ instanceId });
  const kubeconfigPath = `${instanceId}.json`;
  await fs.writeFile(kubeconfigPath, kubeconfig.kubeconfig);
  console.log("  Kubeconfig: ", kubeconfigPath);

  console.log();
  console.log(`kubectl --kubeconfig=${kubeconfigPath} get all`);

  // client.destroyInstance({
  //   instanceId,
  //   reason: "testing script",
  // });
  // console.log("Kubernetes Cluster destroyed");
}

void main();

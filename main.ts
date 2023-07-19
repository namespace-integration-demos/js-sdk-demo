import { createPromiseClient } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-node";
import { CreateInstanceRequest_Feature } from "@buf/namespace_cloud.bufbuild_es/namespace/cloud/compute/v1beta/compute_pb.js";
import { ComputeService } from "@buf/namespace_cloud.bufbuild_connect-es/namespace/cloud/compute/v1beta/compute_connect.js";
import * as fs from "fs/promises";

const transport = createConnectTransport({
  httpVersion: "1.1",
  baseUrl: "https://fra1.compute.namespaceapis.com",
});

async function main() {
  const tokenBytes = await fs.readFile(
    `${process.env.HOME}/Library/Application Support/ns/token.json`,
    { encoding: "utf8" }
  );

  const tokenJSON = JSON.parse(tokenBytes);
  const token = tokenJSON.bearer_token;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);

  const client = createPromiseClient(ComputeService, transport);
  const resp = await client.createInstance(
    {
      shape: {
        virtualCpu: 2,
        memoryMegabytes: 4096,
      },
      features: [CreateInstanceRequest_Feature.KUBERNETES],
    },
    { headers }
  );
  const instanceId = resp.metadata.instanceId;

  console.log("Kubernetes Cluster created");
  console.log("  ID:  ", instanceId);
  console.log("  URL: ", resp.instanceUrl);

  const kubeconfig = await client.getKubernetesConfig(
    { instanceId },
    { headers }
  );
  const kubeconfigPath = `${instanceId}.json`;
  await fs.writeFile(kubeconfigPath, kubeconfig.kubeconfig);
  console.log("  Kubeconfig: ", kubeconfigPath);

  client.destroyInstance(
    {
      instanceId,
      reason: "testing script",
    },
    { headers }
  );
  console.log("Kubernetes Cluster destroyed");
}

void main();

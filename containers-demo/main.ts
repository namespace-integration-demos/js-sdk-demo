import {
	createClients,
	fetchDevelopmentToken,
} from "@namespacelabs/cloud/node";
import { Timestamp } from "@bufbuild/protobuf";

void main();

async function main() {
	const token = await fetchDevelopmentToken();

	const api = createClients("eu", { token });

	// Create instance.
	const resp = await api.compute.createInstance({
		shape: { virtualCpu: 2, memoryMegabytes: 4096 },
		// Run the instance for 30 mins.
		deadline: Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)),
		containers: [
			{
				name: "demo",
				imageRef:
					"ubuntu:22.04@sha256:2b7412e6465c3c7fc5bb21d3e6f1917c167358449fecac8176c6e496e5c1f05f",
				args: [
					"/bin/sh",
					"-c",
					"apt-get update && apt-get install -y curl && curl -v google.com",
				],
			},
		],
	});
	const instanceId = resp.metadata.instanceId;

	console.log("Instance created.");
	console.log("   - ID:  ", instanceId);
	console.log("   - URL: ", resp.instanceUrl);
	console.log("   - Deadline: ", resp.metadata.deadline.toDate());
	console.log();

	for await (const block of api.observability.streamInstanceLogs({
		instanceId,
		follow: true,
	})) {
		for (const line of block.lines) {
			console.log(line.stream, line.timestamp.toDate(), line.content);
		}
	}

	// console.log("Waiting for the instance to initialize...");
	// const waitStream = client.waitInstance({ instanceId });
	// for await (const _ of waitStream);
	// console.log("   - cluster initialized.");

	if (false) {
		await api.compute.destroyInstance({
			instanceId,
			reason: "testing",
		});
		console.log("Instance destroyed");
	}
}

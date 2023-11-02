import { createComputeServiceClient } from "@namespacelabs/cloud/node";

void main();

async function main() {
	const client = createComputeServiceClient("eu", { token: "xxx" });
	try {
		await client.createInstance({});
	} catch {
		console.log("success (auth failure expected)");
	}
}

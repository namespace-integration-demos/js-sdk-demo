import { createComputeServiceClient } from "@namespacelabs/api/node";

void main();

async function main() {
	const client = createComputeServiceClient("fra1", { token: "xxx" });
	try {
		await client.createInstance({});
	} catch {
		console.log("success (auth failure expected)");
	}
}

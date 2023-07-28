import * as fs from "fs/promises";

import {
	CognitoIdentityClient,
	GetOpenIdTokenForDeveloperIdentityCommand,
} from "@aws-sdk/client-cognito-identity";

import { createPromiseClient, Interceptor } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-node";

import { TenantService } from "@buf/namespace_cloud.bufbuild_connect-es/namespace/cloud/iam/v1beta/tenants_connect.js";

// Resources owned by Garden AWS account:
const awsRegion = "eu-central-1";
const identityPool = "eu-central-1:56388dff-961f-42d4-a2ac-6ad118eb7799";
// Allocated by Namespace team:
const namespacePartnerId = "user_01h6dvjymxsh7absdzhkfz9v6f";

void main();

async function main() {
	// Get a token from partner's identity pool identifying a namespace partner.
	console.log("Getting an identity token...");
	const cognitoClient = new CognitoIdentityClient({ region: awsRegion });
	const cognitoToken = await cognitoClient.send(
		new GetOpenIdTokenForDeveloperIdentityCommand({
			IdentityPoolId: identityPool,
			Logins: { "namespace.so": namespacePartnerId },
		})
	);
	const token = "cognito_" + cognitoToken.Token;
	console.log("   - got", token);
	console.log();

	// Configure client stub.
	const transport = createConnectTransport({
		httpVersion: "1.1",
		// fra1 is the default Compute region (Frankfurt).
		baseUrl: "https://iam.namespaceapis.com",
		// Use JSON on the wire instead of binary Protobufs.
		useBinaryFormat: false,
		// Pass Authorization header with all requests.
		interceptors: [bearerAuthInterceptor(token)],
	});
	const client = createPromiseClient(TenantService, transport);

	// Create instance.
	// gardenCustomerId is an string opaque to Namespace.
	console.log("Creating a new tenant...");
	const gardenCustomerId = Math.floor(Math.random() * 1000).toString();
	const createResp = await client.createTenant({
		visibleName: `customer ${gardenCustomerId}`,
		creatorId: gardenCustomerId,
	});
	const tenantId = createResp.tenant.id;
	console.log("   - ID:", tenantId);
	console.log();

	// Obtain a tenant token to access the Compute API.
	console.log("Getting a tenant token...");
	const tokenResp = await client.issueTenantToken({ tenantId });
	console.log("   - got", tokenResp.bearerToken);
	console.log();

	// Save the token to a file.
	await saveTenantToken("./token.json", tokenResp.bearerToken);
	console.log("Saved tenant token to token.json");
	console.log("Run `npm run compute-demo` to use it.");

	if (false) {
		await client.removeTenant({ tenantId });
		console.log("Tenant deleted.");
	}
}

function bearerAuthInterceptor(token: string): Interceptor {
	return (next) => async (req) => {
		req.header.append("Authorization", `Bearer ${token}`);
		return await next(req);
	};
}

async function saveTenantToken(path: string, token: string) {
	await fs.writeFile(path, JSON.stringify({ bearer_token: token }));
}

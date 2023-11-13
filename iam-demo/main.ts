import * as fs from "fs/promises";

import jwt from "jsonwebtoken";
import { createTenantServiceClient } from "@namespacelabs/cloud/node";

const partnerOidcIssuer = "partner.example.com";
const partnerOidcKey = `-----BEGIN EC PRIVATE KEY-----
...
-----END EC PRIVATE KEY-----`;

// Allocated by Namespace team:
const namespacePartnerId = "user_01h6dvjymxsh7absdzhkfz9v6f";

void main();

async function main() {
	// Get a token from partner's identity pool identifying a namespace partner.
	console.log("Getting an identity token...");
	const rawToken = jwt.sign({}, partnerOidcKey, {
		algorithm: "ES256",
		expiresIn: "20m",
		issuer: partnerOidcIssuer,
		audience: "namespace.so",
		subject: namespacePartnerId,
	});
	const token = "oidc_" + rawToken;
	console.log("   - got", token);
	console.log();

	// Configure client stub.
	const client = createTenantServiceClient({ token });

	// Create instance.
	// endUserId is an string opaque to Namespace.
	console.log("Creating a new tenant...");
	const createResp = await client.createTenant({
		visibleName: "example tenant",
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

async function saveTenantToken(path: string, token: string) {
	await fs.writeFile(path, JSON.stringify({ bearer_token: token }));
}

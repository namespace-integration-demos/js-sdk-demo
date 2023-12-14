# Typescript Demo for Namespace Compute API

## Prerequisites

The API is defined using [Buf platform](https://buf.build/) and the demo uses
Typescript bindings generated by it. The underlying protocol is based on HTTP and
uses text JSON encoding, so it is feasible to access it from Node.js or browser
without the generated bindings.

Install Javascript dependencies:

```
# Add @buf package registry to access the generated bindings.
npm config set @buf:registry https://buf.build/gen/npm/v1/

# Install deps.
npm install
```


## Compute API Demo

The demo shows how to connect to the
[Compute API](https://buf.build/namespace/cloud/docs/main:namespace.cloud.compute.v1beta)
and use it to create an ephemeral Kubernetes cluster.

Accessing Compute API requires a tenant token. It can be obtained in two ways:

1. Logging into a normal Namespace account locally:

    ```
    # Install Namespace CLI tool.
    curl -fsSL https://get.namespace.so/cloud/install.sh | sh

    # Login with your Namespace account.
    nsc login
    ```

    The token will be read from `~/Library/Application Support/ns/token.json`.

2. Using IAM API to programmatically obtain a tenant token.

    Use the IAM Demo above to do that and save the token to `./auth.json`.
    If this file exists it will be automatically picked up.

Run the demo:

```
npm run kubernetes-demo
```

The output will look like this:

```
Kubernetes Cluster created.
   - ID:   1k55b4ji6iqgi
   - URL:  https://cloud.namespace.so/9dcjsuhhjno46/cluster/1k55b4ji6iqgi

Waiting for the cluster to initialize...
   - cluster initialized.

Getting kubeconfig.yaml...
   - got:  1k55b4ji6iqgi.yaml

Try:
   $ kubectl --kubeconfig=1k55b4ji6iqgi.yaml get all
```


## IAM API Demo

The demo shows how to authenticate with Namespace using an OpenID Connect token
and programmatically create tenants and obtain tenant tokens.

To run this demo:

1.  Set up AWS Workload Federation with Namespace using a OpenID Connect.

    -   See Authentication section of
        [the API doc](https://buf.build/namespace/cloud/docs/main:namespace.cloud.iam.v1beta)
        for deatils.

    -   If setting up a OIDC issuer from scratch, use the following to generate a keypair:

        ```
        # Generate an EC private key
        openssl ecparam -genkey -name prime256v1 -noout -out private.pem

        # Derive the public key (to be shared with Namespace)
        openssl ec -in private.pem -pubout -out public.pem

        # Get key ID (to pass in NAMESPACE_JWT_KEY_ID)
        openssl pkey -in public.pem -pubin -outform der -out public.der
        sha1sum public.der
        ```

2.  Edit `iam-demo/main.ts` constants to refer to the correct OIDC signing key
    and partner ID.

3.  Start the demo:

    ```
    npm run iam-demo
    ```

The output will look like:

```
Getting an identity token...
   - got oidc_<REDACTED>

Creating a new tenant...
   - ID:   tenant_39jt3aia14qmu

Getting a tenant token...
   - got nsct_<REDACTED>

Saved tenant token to token.json
Run `npm run kubernetes-demo` to use it.
```

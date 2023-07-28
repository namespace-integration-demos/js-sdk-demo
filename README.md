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

## IAM API Demo

The demo shows how to authenticate with Namespace using an AWS Cognito token
and programmatically create tenants and obtain tenant tokens.

To run this demo:

1.  Set up AWS Workload Federation with Namespace using a Cognito Identity Pool.

    See Authentication section of
    [the API doc](https://buf.build/namespace/cloud/docs/main:namespace.cloud.iam.v1beta)
    for deatils.

2.  Edit `iam-demo/main.ts` constants to refer to the identity pool and partner ID
    created on step 1.

3.  Make sure that AWS SDK has approporiate credentials locally. For that either:

    -   If running on a local developer machine: run `aws sso login` to authenticate
        interactively.
    -   If running on EC2: make sure to
        [assign an IAM instance profile](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/java-dg-roles.html)
        granting `cognito-identity:GetOpenIdTokenForDeveloperIdentity` permission on
        the Cognito Identity Pool created on step 1.

4.  Start the demo:

    ```
    npm run iam-demo
    ```

The output will look like:

```
Getting an identity token...
   - got cognito_<REDACTED>

Creating a new tenant...
   - ID:   tenant_39jt3aia14qmu

Getting a tenant token...
   - got nsct_<REDACTED>

Saved tenant token to token.json
Run `npm run compute-demo` to use it.
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
npm run compute-demo
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

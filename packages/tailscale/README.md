# @ryanmoreau/tailscale-sdk

Zero-dependency TypeScript SDK for the [Tailscale API v2](https://tailscale.com/api).

- Dual ESM/CJS — works in Node 18+, Bun, Deno, and edge runtimes
- API key and OAuth client credentials authentication
- Automatic retries with exponential backoff
- Standalone webhook signature verification (Web Crypto API)

## Install

Not published to a registry — that's deliberate. It's zero-dependency
TypeScript, so use it straight from source. Clone the monorepo and build:

```sh
git clone https://github.com/RyanMoreau/tailscale-sdk
cd tailscale-sdk && bun install
bun run build   # packages/tailscale/dist — ESM + CJS + type declarations
```

Then reference the built `dist/`, or drop `packages/tailscale/src` straight into
your own project — there are no transitive dependencies to reconcile.

## Quick Start

### API Key Authentication

```ts
import { TailscaleClient } from "@ryanmoreau/tailscale-sdk";

const client = new TailscaleClient({
  apiKey: process.env.TAILSCALE_API_KEY,
  tailnet: "-", // "-" for the default tailnet
});

const devices = await client.devices.list();
for (const device of devices) {
  console.log(device.name, device.addresses);
}
```

### OAuth Authentication

```ts
import { TailscaleClient } from "@ryanmoreau/tailscale-sdk";

const client = new TailscaleClient({
  oauthClientId: process.env.TAILSCALE_OAUTH_CLIENT_ID,
  oauthClientSecret: process.env.TAILSCALE_OAUTH_CLIENT_SECRET,
  tailnet: "-",
});

const key = await client.keys.create({
  capabilities: {
    devices: {
      create: {
        reusable: false,
        ephemeral: true,
        preauthorized: true,
        tags: ["tag:server"],
      },
    },
  },
  expirySeconds: 86400,
  description: "CI ephemeral key",
});

console.log(key.key);
```

### Webhook Signature Verification

```ts
import { verifyWebhookSignature } from "@ryanmoreau/tailscale-sdk/webhooks";

const isValid = await verifyWebhookSignature({
  payload: requestBody,
  signature: request.headers["tailscale-webhook-signature"],
  secret: process.env.TAILSCALE_WEBHOOK_SECRET,
});

if (!isValid) {
  return new Response("Invalid signature", { status: 401 });
}
```

## API Reference

### Client Options

```ts
interface TailscaleClientOptions {
  // Authentication (provide one)
  apiKey?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;

  // Required
  tailnet: string; // Your tailnet name, or "-" for default

  // Optional
  baseUrl?: string; // Default: "https://api.tailscale.com"
  timeout?: number; // Default: 30000 (ms)
  maxRetries?: number; // Default: 3
  fetch?: typeof fetch; // Custom fetch implementation
}
```

### Resources

#### Devices

```ts
client.devices.list();
client.devices.get(deviceId);
client.devices.delete(deviceId);
client.devices.authorize(deviceId, true);
client.devices.setTags(deviceId, ["tag:server"]);
client.devices.setName(deviceId, "new-name");
client.devices.setKey(deviceId, { keyExpiryDisabled: true });
client.devices.getRoutes(deviceId);
client.devices.setRoutes(deviceId, ["10.0.0.0/24"]);
```

#### Auth Keys

```ts
client.keys.list();
client.keys.create({ capabilities, expirySeconds, description });
client.keys.get(keyId);
client.keys.delete(keyId);
```

#### DNS

```ts
client.dns.getNameservers();
client.dns.setNameservers(["8.8.8.8"]);
client.dns.getSearchPaths();
client.dns.setSearchPaths(["example.com"]);
client.dns.getPreferences();
client.dns.setPreferences({ magicDNS: true });
client.dns.getSplitDns();
client.dns.setSplitDns({ "example.com": ["1.1.1.1"] });
client.dns.updateSplitDns({ "example.com": ["1.1.1.1"] });
```

#### Policy (ACLs)

```ts
const { policy, etag } = await client.policy.get();
const { hujson, etag } = await client.policy.getRaw();
await client.policy.set(policy, etag); // Requires ETag for optimistic concurrency
await client.policy.validate(policy);
```

#### Webhooks

```ts
client.webhooks.list();
client.webhooks.create({ endpointUrl, providerType, subscriptions });
client.webhooks.get(endpointId);
client.webhooks.update(endpointId, { subscriptions });
client.webhooks.delete(endpointId);
client.webhooks.test(endpointId);
client.webhooks.rotateSecret(endpointId);
```

### Error Handling

```ts
import { TailscaleApiError } from "@ryanmoreau/tailscale-sdk";

try {
  await client.devices.get("nonexistent");
} catch (error) {
  if (error instanceof TailscaleApiError) {
    console.log(error.status); // 404
    console.log(error.message); // "Not Found"
    console.log(error.requestId); // Request ID from headers
    console.log(error.data); // Raw error response body
  }
}
```

## License

MIT

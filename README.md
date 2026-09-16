# Tailscale SDK

Zero-dependency TypeScript SDK for the [Tailscale API v2](https://tailscale.com/api).

## Packages

- [`@ryanmoreau/tailscale-sdk`](./packages/tailscale) - TypeScript SDK for Tailscale API
- [`dashboard`](./packages/dashboard) - Example dashboard application (run locally)

## Getting Started

No registry, no tokens — clone and run:

```sh
git clone https://github.com/RyanMoreau/tailscale-sdk
cd tailscale-sdk
bun install
bun run build   # compiles the SDK to dist/ — the dashboard imports it
```

The SDK lives in [`packages/tailscale`](./packages/tailscale) with zero runtime
dependencies, so you can use it straight from the workspace, build it to a
portable `dist/`, or vendor the source into your own project.

## Quick Start

```ts
import { TailscaleClient } from "@ryanmoreau/tailscale-sdk";

const client = new TailscaleClient({
  apiKey: process.env.TAILSCALE_API_KEY,
  tailnet: "-", // "-" for the default tailnet
});

const devices = await client.devices.list();
console.log(devices);
```

See the [SDK documentation](./packages/tailscale/README.md) for full API reference.

## Dashboard

The included React dashboard demonstrates how to use the SDK with [TanStack Query](https://tanstack.com/query) hooks. It provides a full UI for managing your tailnet — devices, auth keys, DNS, ACLs, and more.

### Running the Dashboard

```sh
bun install
bun run build   # build the SDK first — the dashboard imports it
cp packages/dashboard/.env.sample packages/dashboard/.env
# Edit .env: set TAILSCALE_API_KEY (admin console → Settings → Keys)
#            and TAILSCALE_TAILNET (or "-" for the default tailnet)
bun run dev
```

### React Hooks

The dashboard ships with ready-to-use hooks that wrap the SDK's API proxy:

**Devices** — `use-devices.ts`
- `useDevices()` — list all devices (auto-refreshes every 30s)
- `useDevice(id)` — get a single device
- `useDeviceRoutes(id)` — get advertised/enabled routes
- `useAuthorizeDevice()` — authorize or deauthorize a device
- `useSetDeviceTags()` — update device tags
- `useSetDeviceRoutes()` — enable/disable subnet routes
- `useDeleteDevice()` — remove a device from the tailnet

**Auth Keys** — `use-keys.ts`
- `useKeys()` — list all auth keys (auto-refreshes every 60s)
- `useCreateKey()` — create a new auth key with capabilities
- `useDeleteKey()` — revoke an auth key

**DNS** — `use-dns.ts`
- `useNameservers()` — get global nameservers
- `useSearchPaths()` — get DNS search paths
- `useSplitDns()` — get split DNS configuration
- `useDnsPreferences()` — get MagicDNS preferences

**Policy/ACLs** — `use-policy.ts`
- `usePolicy()` — get the current ACL policy (HuJSON)
- `useValidatePolicy()` — validate a policy without applying
- `useApplyPolicyRecipe()` — apply a preset ACL recipe

**Webhooks** — `use-webhooks.ts`
- `useWebhooks()` — list all webhook endpoints

**Users** — `use-users.ts`
- `useUsers()` — list all users in the tailnet

## Development

This is a monorepo managed with Bun workspaces.

```sh
# Install dependencies
bun install

# Run the dashboard
bun run dev

# Build the SDK
bun run build

# Run tests
bun test

# Lint code
bun run lint
```

## Using the SDK in your own project

There's no published package — that's deliberate. The SDK is zero-dependency
TypeScript, so the simplest paths are to build it and point at the output, or
just vendor the source:

```sh
cd packages/tailscale
bun run build   # -> dist/ (ESM + CJS + type declarations)
```

Reference the built `dist/`, or drop `packages/tailscale/src` straight into your
own codebase — there are no transitive dependencies to reconcile.

## License

MIT - See [LICENSE](./LICENSE) for details

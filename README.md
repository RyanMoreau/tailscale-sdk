# Tailscale SDK

Zero-dependency TypeScript SDK for the [Tailscale API v2](https://tailscale.com/api).

## Packages

- [`@ryanmoreau/tailscale-sdk`](./packages/tailscale) - TypeScript SDK for Tailscale API
- [`dashboard`](./packages/dashboard) - Example dashboard application (run locally)

## Installation

### From GitHub Packages

Configure your `.npmrc` to use GitHub Packages:

```sh
echo "@ryanmoreau:registry=https://npm.pkg.github.com" >> .npmrc
```

Install the SDK:

```sh
npm install @ryanmoreau/tailscale-sdk
# or
bun add @ryanmoreau/tailscale-sdk
```

**Authentication:** For private packages, you'll need to authenticate with GitHub Packages. Create a personal access token with `read:packages` scope.

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
cp packages/dashboard/.env.sample packages/dashboard/.env
# Edit .env with your Tailscale API key
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

## Publishing

Packages are automatically published to GitHub Packages when a new release is created.

To publish manually:

1. Update the version in `packages/tailscale/package.json`
2. Create a new GitHub release
3. The GitHub Action will automatically build and publish the package

## License

MIT - See [LICENSE](./LICENSE) for details

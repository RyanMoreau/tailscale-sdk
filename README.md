# Tailscale SDK

Zero-dependency TypeScript SDK for the [Tailscale API v2](https://tailscale.com/api).

## Packages

- [`@ryanmoreau/tailscale-sdk`](./packages/tailscale) - TypeScript SDK for Tailscale API
- [`dashboard`](./packages/dashboard) - Example dashboard application (private)

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

## Development

This is a monorepo managed with Bun workspaces.

```sh
# Install dependencies
bun install

# Build packages
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
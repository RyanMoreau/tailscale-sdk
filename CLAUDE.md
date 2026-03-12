# Tailscale SDK

Zero-dependency TypeScript SDK for the Tailscale API v2. Bun workspaces monorepo.

## Packages

- `packages/tailscale` — The SDK (`@ryanmoreau/tailscale-sdk`). Dual ESM/CJS, built with tsup.
- `packages/dashboard` — Example dashboard app (React + Vite). Not published.

## Commands

```sh
bun install          # install all dependencies
bun run build        # build the SDK (outputs to packages/tailscale/dist/)
bun test             # run SDK tests
bun run lint         # lint with Biome
bun run lint:fix     # lint and auto-fix
bun run typecheck    # typecheck with tsc --noEmit
```

### Dashboard

```sh
bun run --filter dashboard dev          # start Vite dev server
bun run --filter dashboard dev:server   # start backend API server
```

The dashboard needs a `.env` in `packages/dashboard/` with `TAILSCALE_API_KEY`.

## SDK Structure

- `src/client.ts` — `TailscaleClient` entry point, wires auth + HTTP + resources
- `src/http.ts` — Fetch wrapper with retry, timeout, error mapping
- `src/auth/` — API key and OAuth authentication providers
- `src/resources/` — API resource classes (devices, keys, dns, policy, webhooks)
- `src/types/` — TypeScript type definitions for all API objects
- `src/webhooks/` — Standalone webhook signature verification
- `src/errors.ts` — Error classes
- `tests/` — Unit tests (mocked fetch, `bun test`)

## Conventions

- Use Bun for everything (runtime, tests, package management)
- Zero runtime dependencies — uses only built-in Web APIs (fetch, crypto, etc.)
- All dates are ISO 8601 strings, not Date objects
- Biome for formatting: tabs, double quotes, semicolons, 100 char line width

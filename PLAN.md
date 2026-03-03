# Tailscale TypeScript SDK — Implementation Plan

## Context

Build `@ryanmoreau/tailscale`, a zero-dependency TypeScript SDK for the Tailscale API v2, as a portfolio project for a Tailscale job application. The SDK should be the first quality TypeScript SDK for Tailscale's API — published to npm, dual ESM/CJS, works on Node 18+, Bun, Deno, and edge runtimes. A demo dashboard follows as phase 2.

**Repo**: `tailscale-sdk` (Bun workspaces monorepo, fresh empty directory)
**Git remote**: `git@github.com:ryanmoreau/tailscale-sdk.git` (personal account)
**Package**: `@ryanmoreau/tailscale` (confirmed available on npm)
**Resources**: Devices, Auth Keys, DNS, Policy/ACLs, Webhooks

---

## 1. Repository Setup

### Structure

```
tailscale-sdk/
├── package.json                    # Root: { workspaces: ["packages/*"] }
├── biome.json
├── tsconfig.json                   # Base compiler options
├── LICENSE                         # MIT
├── README.md
├── .github/workflows/ci.yml
└── packages/
    └── tailscale/                  # @ryanmoreau/tailscale
        ├── package.json
        ├── tsconfig.json
        ├── tsup.config.ts
        ├── README.md               # Write first — this is the acceptance criteria
        ├── src/
        │   ├── index.ts            # Barrel export
        │   ├── client.ts           # TailscaleClient class
        │   ├── http.ts             # Fetch wrapper: retry, timeout, error mapping
        │   ├── errors.ts           # TailscaleError, TailscaleApiError
        │   ├── spec-overrides.ts   # Known API spec deviations
        │   ├── auth/
        │   │   ├── index.ts
        │   │   ├── types.ts        # AuthProvider interface
        │   │   ├── api-key.ts      # Basic auth provider
        │   │   └── oauth.ts        # OAuth2 client_credentials + refresh mutex
        │   ├── resources/
        │   │   ├── devices.ts
        │   │   ├── keys.ts
        │   │   ├── dns.ts
        │   │   ├── policy.ts
        │   │   └── webhooks.ts
        │   ├── types/
        │   │   ├── index.ts
        │   │   ├── device.ts
        │   │   ├── key.ts
        │   │   ├── dns.ts
        │   │   ├── policy.ts
        │   │   ├── webhook.ts
        │   │   └── common.ts
        │   └── webhooks/
        │       ├── index.ts
        │       ├── verify.ts       # HMAC-SHA256 verification
        │       └── types.ts        # WebhookEvent, WebhookSubscriptionType
        └── tests/
            ├── http.test.ts
            ├── auth.test.ts
            ├── devices.test.ts
            ├── keys.test.ts
            ├── dns.test.ts
            ├── policy.test.ts
            ├── webhooks.test.ts
            └── webhook-verify.test.ts
```

### Tooling

- **Runtime/Test**: Bun (`bun test` with `mock()` for fetch mocking)
- **Build**: tsup → dual ESM/CJS + `.d.ts`
- **Lint/Format**: Biome (tabs, double quotes, semicolons, 100 line width)
- **CI**: GitHub Actions (typecheck, lint, test on PR)

---

## 2. Client API Design

```typescript
import { TailscaleClient } from '@ryanmoreau/tailscale';

// API key auth (auto-detected)
const ts = new TailscaleClient({
  tailnet: 'example.com',
  apiKey: process.env.TAILSCALE_API_KEY,
});

// OAuth auth (auto-detected)
const ts = new TailscaleClient({
  tailnet: 'example.com',
  oauthClientId: process.env.TAILSCALE_OAUTH_CLIENT_ID,
  oauthClientSecret: process.env.TAILSCALE_OAUTH_CLIENT_SECRET,
});
```

Config options: `baseUrl`, `timeout` (30s default), `retry` (`{ maxRetries, baseDelay, maxDelay }`), `fetch` (injectable for testing).

---

## 3. API Endpoint Mapping (Corrections Applied)

### Devices

| SDK Method | HTTP | Path |
|---|---|---|
| `ts.devices.list()` | GET | `/tailnet/{tailnet}/devices` |
| `ts.devices.get(id)` | GET | `/device/{id}` |
| `ts.devices.delete(id)` | DELETE | `/device/{id}` |
| `ts.devices.authorize(id, true)` | POST | `/device/{id}/authorized` |
| `ts.devices.setTags(id, tags)` | POST | `/device/{id}/tags` |
| `ts.devices.setName(id, name)` | POST | `/device/{id}/name` |
| `ts.devices.setKey(id, opts)` | POST | `/device/{id}/key` |
| `ts.devices.getRoutes(id)` | GET | `/device/{id}/routes` |
| `ts.devices.setRoutes(id, routes)` | POST | `/device/{id}/routes` |

Note: Routes response uses `advertisedRoutes` and `enabledRoutes` fields.

### Auth Keys

| SDK Method | HTTP | Path |
|---|---|---|
| `ts.keys.list()` | GET | `/tailnet/{tailnet}/keys` |
| `ts.keys.create(req)` | POST | `/tailnet/{tailnet}/keys` |
| `ts.keys.get(id)` | GET | `/tailnet/{tailnet}/keys/{id}` |
| `ts.keys.delete(id)` | DELETE | `/tailnet/{tailnet}/keys/{id}` |

Capabilities structure: `{ devices: { create: { reusable, ephemeral, preauthorized, tags } } }`

### DNS

| SDK Method | HTTP | Path |
|---|---|---|
| `ts.dns.getNameservers()` | GET | `/tailnet/{tailnet}/dns/nameservers` |
| `ts.dns.setNameservers(req)` | POST | `/tailnet/{tailnet}/dns/nameservers` |
| `ts.dns.getSearchPaths()` | GET | `/tailnet/{tailnet}/dns/searchpaths` |
| `ts.dns.setSearchPaths(req)` | POST | `/tailnet/{tailnet}/dns/searchpaths` |
| `ts.dns.getPreferences()` | GET | `/tailnet/{tailnet}/dns/preferences` |
| `ts.dns.setPreferences(req)` | POST | `/tailnet/{tailnet}/dns/preferences` |
| `ts.dns.getSplitDns()` | GET | `/tailnet/{tailnet}/dns/split-dns` |
| `ts.dns.setSplitDns(config)` | PUT | `/tailnet/{tailnet}/dns/split-dns` |
| `ts.dns.updateSplitDns(config)` | PATCH | `/tailnet/{tailnet}/dns/split-dns` |

### Policy/ACLs

| SDK Method | HTTP | Path | Notes |
|---|---|---|---|
| `ts.policy.get()` | GET | `/tailnet/{tailnet}/acl` | Returns Policy + ETag |
| `ts.policy.getRaw()` | GET | `/tailnet/{tailnet}/acl` | Accept: text/plain → HuJSON |
| `ts.policy.set(policy, etag)` | POST | `/tailnet/{tailnet}/acl` | Requires `If-Match` header |
| `ts.policy.validate(policy)` | POST | `/tailnet/{tailnet}/acl/validate` | Validates without applying |

ETag is extracted from response headers and required on set to enable optimistic concurrency.

### Webhooks

| SDK Method | HTTP | Path |
|---|---|---|
| `ts.webhooks.list()` | GET | `/tailnet/{tailnet}/webhooks` |
| `ts.webhooks.create(req)` | POST | `/tailnet/{tailnet}/webhooks` |
| `ts.webhooks.get(id)` | GET | `/tailnet/{tailnet}/webhooks/{id}` |
| `ts.webhooks.update(id, req)` | PATCH | `/tailnet/{tailnet}/webhooks/{id}` |
| `ts.webhooks.delete(id)` | DELETE | `/tailnet/{tailnet}/webhooks/{id}` |
| `ts.webhooks.test(id)` | POST | `/tailnet/{tailnet}/webhooks/{id}/test` |
| `ts.webhooks.rotateSecret(id)` | POST | `/tailnet/{tailnet}/webhooks/{id}/rotate` |

Webhook field name: `endpointUrl` (camelCase in JSON).

### Webhook Signature Verification (standalone export)

```typescript
import { verifyWebhookSignature } from '@ryanmoreau/tailscale/webhooks';

const valid = await verifyWebhookSignature({
  payload: rawBody,
  signature: req.headers['tailscale-webhook-signature'],
  secret: process.env.WEBHOOK_SECRET,
});
```

Header format: `t=<timestamp>,v1=<hex-hmac>`. Signed string: `<timestamp>.<payload>`. Uses Web Crypto API (HMAC-SHA256) for zero deps.

---

## 4. Key Internal Designs

### Auth Providers

```typescript
interface AuthProvider {
  getAuthHeaders(): Promise<Record<string, string>>;
}
```

- **ApiKeyAuthProvider**: `Authorization: Basic ${btoa(apiKey + ':')}`
- **OAuthAuthProvider**: POST to `/api/v2/oauth/token` with `client_credentials` grant. Caches token, refreshes 5 minutes before expiry, mutex prevents concurrent refresh storms.

Auto-detection: if `apiKey` present → ApiKey provider; if `oauthClientId` + `oauthClientSecret` → OAuth provider; both → error; neither → error.

### HTTP Layer (`http.ts`)

- Base URL: `https://api.tailscale.com/api/v2`
- Timeout: `AbortController` + `setTimeout`, default 30s
- Retries: max 3, on `[429, 500, 502, 503, 504]` only
- Respects `Retry-After` header, falls back to exponential backoff + random jitter (0-500ms)
- Error mapping: non-2xx → `TailscaleApiError { status, message, data, requestId }`
- Injectable `fetch` for testing and edge runtimes
- All dates returned as ISO 8601 strings (not Date objects)

### Build Output

```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts', 'src/webhooks/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  target: 'node18',
  splitting: false,
});
```

Two entry points: main SDK + standalone webhook verification.

---

## 5. Implementation Order

### Step 1: Workspace + Scaffold
- `bun init`, workspace config, biome, tsconfig, gitignore
- `packages/tailscale/` scaffold with package.json, tsup config
- Git init + initial commit

### Step 2: README-First + Types
- **Write the README first.** Three cookbook examples (API key auth + list devices, OAuth auth + create key, webhook verification) become the acceptance criteria. When these examples compile and run against the built SDK, we're done.
- Type generation strategy: hand-write types directly from the [Tailscale API docs](https://tailscale.com/api) and OpenAPI spec. No Hey API codegen step — the API surface is small enough that hand-written types give us full control over naming, doc comments, and the `spec-overrides.ts` corrections. If we adopt codegen later, the separate `types/` directory makes swapping trivial.
- All type definitions in `src/types/*.ts` (zero deps, inform everything)
- Error classes in `src/errors.ts`

### Step 3: Auth Providers
- `AuthProvider` interface
- `ApiKeyAuthProvider` (trivial)
- `OAuthAuthProvider` (token lifecycle + refresh mutex)
- Tests for both

### Step 4: HTTP Layer
- Fetch wrapper with auth injection, retry, timeout, error mapping
- Tests: retry logic, Retry-After parsing, jitter, timeout, error mapping

### Step 5: Resources (in order)
1. `DevicesResource` — most used, validates HTTP layer
2. `AuthKeysResource` — straightforward CRUD
3. `DnsResource` — multiple sub-endpoints
4. `PolicyResource` — ETag complexity
5. `WebhooksResource` — includes test/rotate
- Tests for each with mocked fetch

### Step 6: Webhook Verification
- `verifyWebhookSignature` using Web Crypto API
- Tests: valid, expired, tampered signatures

### Step 7: Client + Barrel Exports
- `TailscaleClient` class wiring auth → http → resources
- `src/index.ts` barrel export
- `src/webhooks/index.ts` standalone export
- **`spec-overrides.ts`**: Document every known deviation between the Tailscale OpenAPI spec and actual API behavior (field casing, missing fields, undocumented responses). This file is a hiring signal — it shows you've read the spec critically, not just consumed it. Include comments with links to the spec section and what the real behavior is.

### Step 8: Polish + Ship
- Finalize README — verify the three cookbook examples from Step 2 compile and run against the built SDK
- Build verification (`bun run build`, inspect dist/)
- `npm pack` dry run
- GitHub Actions CI
- `npm publish`

---

## 6. Verification

1. **Type check**: `bun run typecheck` (tsc --noEmit)
2. **Lint**: `bun run lint` (biome check)
3. **Unit tests**: `bun test` — all resources mocked, auth providers, HTTP retry logic, webhook verification
4. **Build**: `bun run build` → verify `dist/` has `.js`, `.cjs`, `.d.ts` for both entry points
5. **Package contents**: `npm pack --dry-run` → verify only `dist/` is included
6. **Import test**: Create a temp script that `import`s from the built package and instantiates the client
7. **E2E (env-gated)**: Single test that creates a key, lists devices, and deletes the key against a real tailnet (requires `TAILSCALE_API_KEY` env var)

/**
 * Tailscale API v2 — Known Spec Deviations
 *
 * This file documents every known divergence between the Tailscale OpenAPI specification
 * and the actual API behavior observed via the Go client (tailscale-client-go-v2) and
 * live testing. These notes are maintained so that SDK types remain accurate regardless
 * of spec updates.
 *
 * ──────────────────────────────────────────────────────────────────
 *
 * 1. Device Routes — Field Casing
 *    Spec section: GET /api/v2/device/{deviceId}/routes
 *    Spec says:    `AdvertisedRoutes`, `EnabledRoutes` (PascalCase)
 *    Actual:       `advertisedRoutes`, `enabledRoutes` (camelCase)
 *    Source:       tailscale-client-go-v2/devices.go `DeviceRoutes` struct uses
 *                  `json:"advertisedRoutes"` and `json:"enabledRoutes"`.
 *    SDK mapping:  types/device.ts — DeviceRoutes interface uses camelCase.
 *
 * 2. Webhook Endpoint URL — Field Name
 *    Spec section: POST /api/v2/tailnet/{tailnet}/webhooks
 *    Spec says:    `endpoint_url` (snake_case) in some spec revisions
 *    Actual:       `endpointUrl` (camelCase)
 *    Source:       tailscale-client-go-v2/webhooks.go `Webhook` struct uses
 *                  `json:"endpointUrl"`.
 *    SDK mapping:  types/webhook.ts — Webhook interface uses `endpointUrl`.
 *
 * 3. Webhook Endpoint ID — Field Name
 *    Spec section: Webhook responses
 *    Actual:       `endpointId` (camelCase)
 *    Source:       tailscale-client-go-v2/webhooks.go `json:"endpointId"`.
 *    SDK mapping:  types/webhook.ts — Webhook interface uses `endpointId`.
 *
 * 4. Device — `AdvertisedRoutes` on Device Object
 *    Spec section: GET /api/v2/tailnet/{tailnet}/devices
 *    Note:         The full device object returned by the list endpoint also contains
 *                  `advertisedRoutes` and `enabledRoutes` inline (camelCase).
 *    Source:       tailscale-client-go-v2/devices.go `Device` struct.
 *    SDK mapping:  types/device.ts — Device interface includes both fields.
 *
 * 5. Policy File — ETag Header for Optimistic Concurrency
 *    Spec section: GET/POST /api/v2/tailnet/{tailnet}/acl
 *    Note:         GET returns an `ETag` response header. POST requires `If-Match`
 *                  request header with the ETag value for optimistic concurrency control.
 *                  This is not always clearly documented in the OpenAPI spec.
 *    SDK mapping:  resources/policy.ts — `get()` extracts ETag, `set()` sends If-Match.
 *
 * 6. Policy File — Raw HuJSON via Accept Header
 *    Spec section: GET /api/v2/tailnet/{tailnet}/acl
 *    Note:         Sending `Accept: text/plain` returns the raw HuJSON policy as a string
 *                  instead of the parsed JSON object. Not documented in all spec revisions.
 *    SDK mapping:  resources/policy.ts — `getRaw()` sends Accept: text/plain.
 *
 * 7. Auth Key — Response Wrapping
 *    Spec section: GET /api/v2/tailnet/{tailnet}/keys
 *    Note:         List endpoint wraps the response in `{ "keys": [...] }`.
 *    SDK mapping:  resources/keys.ts — unwraps the `keys` array.
 *
 * 8. Device List — Response Wrapping
 *    Spec section: GET /api/v2/tailnet/{tailnet}/devices
 *    Note:         List endpoint wraps the response in `{ "devices": [...] }`.
 *    SDK mapping:  resources/devices.ts — unwraps the `devices` array.
 *
 * 9. Webhook List — Response Wrapping
 *    Spec section: GET /api/v2/tailnet/{tailnet}/webhooks
 *    Note:         List endpoint wraps the response in `{ "webhooks": [...] }`.
 *    SDK mapping:  resources/webhooks.ts — unwraps the `webhooks` array.
 */
export {};

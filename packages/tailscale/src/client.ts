import { ApiKeyAuthProvider, OAuthAuthProvider } from "./auth/index.ts";
import type { AuthProvider } from "./auth/types.ts";
import { TailscaleError } from "./errors.ts";
import { HttpClient } from "./http.ts";
import { DevicesResource } from "./resources/devices.ts";
import { DnsResource } from "./resources/dns.ts";
import { KeysResource } from "./resources/keys.ts";
import { PolicyResource } from "./resources/policy.ts";
import { UsersResource } from "./resources/users.ts";
import { WebhooksResource } from "./resources/webhooks.ts";

export interface TailscaleClientOptions {
	/** API key for authentication. Mutually exclusive with OAuth options. */
	apiKey?: string;
	/** OAuth client ID. Must be used with `oauthClientSecret`. */
	oauthClientId?: string;
	/** OAuth client secret. Must be used with `oauthClientId`. */
	oauthClientSecret?: string;
	/** Your tailnet name, or "-" for the default tailnet. */
	tailnet: string;
	/** Base URL for the Tailscale API. Default: "https://api.tailscale.com/api/v2". */
	baseUrl?: string;
	/** Request timeout in milliseconds. Default: 30000. */
	timeout?: number;
	/** Maximum number of retries for transient failures. Default: 3. */
	maxRetries?: number;
	/** Custom fetch implementation for testing or edge runtimes. */
	fetch?: typeof fetch;
}

export class TailscaleClient {
	readonly devices: DevicesResource;
	readonly keys: KeysResource;
	readonly dns: DnsResource;
	readonly policy: PolicyResource;
	readonly users: UsersResource;
	readonly webhooks: WebhooksResource;

	constructor(opts: TailscaleClientOptions) {
		const auth = resolveAuth(opts);
		const baseUrl = opts.baseUrl ?? "https://api.tailscale.com/api/v2";

		const http = new HttpClient({
			baseUrl,
			auth,
			timeout: opts.timeout ?? 30000,
			maxRetries: opts.maxRetries ?? 3,
			fetch: opts.fetch ?? globalThis.fetch,
		});

		this.devices = new DevicesResource(http, opts.tailnet);
		this.keys = new KeysResource(http, opts.tailnet);
		this.dns = new DnsResource(http, opts.tailnet);
		this.policy = new PolicyResource(http, opts.tailnet);
		this.users = new UsersResource(http, opts.tailnet);
		this.webhooks = new WebhooksResource(http, opts.tailnet);
	}
}

function resolveAuth(opts: TailscaleClientOptions): AuthProvider {
	const hasApiKey = !!opts.apiKey;
	const hasOAuth = !!opts.oauthClientId || !!opts.oauthClientSecret;

	if (hasApiKey && hasOAuth) {
		throw new TailscaleError("Provide either apiKey or oauthClientId/oauthClientSecret, not both.");
	}

	if (!hasApiKey && !hasOAuth) {
		throw new TailscaleError(
			"Authentication required. Provide apiKey or oauthClientId/oauthClientSecret.",
		);
	}

	if (opts.apiKey) {
		return new ApiKeyAuthProvider(opts.apiKey);
	}

	if (!opts.oauthClientId || !opts.oauthClientSecret) {
		throw new TailscaleError("Both oauthClientId and oauthClientSecret are required.");
	}

	return new OAuthAuthProvider({
		clientId: opts.oauthClientId,
		clientSecret: opts.oauthClientSecret,
		baseUrl: opts.baseUrl ? opts.baseUrl.replace(/\/api\/v2$/, "") : "https://api.tailscale.com",
		fetch: opts.fetch,
	});
}

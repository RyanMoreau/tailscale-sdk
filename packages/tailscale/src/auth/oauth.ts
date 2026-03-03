import { TailscaleError } from "../errors.ts";
import type { AuthProvider } from "./types.ts";

interface OAuthToken {
	accessToken: string;
	expiresAt: number;
}

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

export class OAuthAuthProvider implements AuthProvider {
	private readonly clientId: string;
	private readonly clientSecret: string;
	private readonly baseUrl: string;
	private readonly fetchFn: typeof fetch;

	private token: OAuthToken | null = null;
	private refreshPromise: Promise<OAuthToken> | null = null;

	constructor(opts: {
		clientId: string;
		clientSecret: string;
		baseUrl?: string;
		fetch?: typeof fetch;
	}) {
		this.clientId = opts.clientId;
		this.clientSecret = opts.clientSecret;
		this.baseUrl = opts.baseUrl ?? "https://api.tailscale.com";
		this.fetchFn = opts.fetch ?? globalThis.fetch;
	}

	async getAuthHeaders(): Promise<Record<string, string>> {
		const token = await this.getToken();
		return { Authorization: `Bearer ${token.accessToken}` };
	}

	private async getToken(): Promise<OAuthToken> {
		if (this.token && Date.now() < this.token.expiresAt - REFRESH_BUFFER_MS) {
			return this.token;
		}

		// Mutex: if a refresh is already in-flight, wait for it
		if (this.refreshPromise) {
			return this.refreshPromise;
		}

		this.refreshPromise = this.fetchToken();
		try {
			const token = await this.refreshPromise;
			this.token = token;
			return token;
		} finally {
			this.refreshPromise = null;
		}
	}

	private async fetchToken(): Promise<OAuthToken> {
		const body = new URLSearchParams({
			client_id: this.clientId,
			client_secret: this.clientSecret,
			grant_type: "client_credentials",
		});

		const response = await this.fetchFn(`${this.baseUrl}/api/v2/oauth/token`, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: body.toString(),
		});

		if (!response.ok) {
			throw new TailscaleError(`OAuth token request failed with status ${response.status}`);
		}

		const data = (await response.json()) as {
			access_token: string;
			expires_in: number;
		};

		return {
			accessToken: data.access_token,
			expiresAt: Date.now() + data.expires_in * 1000,
		};
	}
}

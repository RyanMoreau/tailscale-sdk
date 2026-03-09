import { describe, expect, it } from "bun:test";
import { ApiKeyAuthProvider } from "../src/auth/api-key.ts";
import { OAuthAuthProvider } from "../src/auth/oauth.ts";

describe("ApiKeyAuthProvider", () => {
	it("returns Basic auth header with base64-encoded key", async () => {
		const provider = new ApiKeyAuthProvider("tskey-api-test123");
		const headers = await provider.getAuthHeaders();
		const expected = btoa("tskey-api-test123:");
		expect(headers).toEqual({ Authorization: `Basic ${expected}` });
	});
});

describe("OAuthAuthProvider", () => {
	it("fetches and caches an OAuth token", async () => {
		let callCount = 0;
		const mockFetch = async (_input: string | URL | Request) => {
			callCount++;
			return new Response(
				JSON.stringify({
					access_token: "tskey-oauth-token-123",
					token_type: "Bearer",
					expires_in: 3600,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		};

		const provider = new OAuthAuthProvider({
			clientId: "client-id",
			clientSecret: "client-secret",
			fetch: mockFetch as typeof fetch,
		});

		const headers1 = await provider.getAuthHeaders();
		expect(headers1).toEqual({ Authorization: "Bearer tskey-oauth-token-123" });

		const headers2 = await provider.getAuthHeaders();
		expect(headers2).toEqual({ Authorization: "Bearer tskey-oauth-token-123" });

		// Token was cached — only one fetch call
		expect(callCount).toBe(1);
	});

	it("sends client_credentials grant to the OAuth endpoint", async () => {
		let capturedUrl = "";
		let capturedBody = "";

		const mockFetch = async (input: string | URL | Request, init?: RequestInit) => {
			capturedUrl = String(input);
			capturedBody = String(init?.body);
			return new Response(JSON.stringify({ access_token: "tok", expires_in: 3600 }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const provider = new OAuthAuthProvider({
			clientId: "my-id",
			clientSecret: "my-secret",
			baseUrl: "https://custom.api.example.com",
			fetch: mockFetch as typeof fetch,
		});

		await provider.getAuthHeaders();

		expect(capturedUrl).toBe("https://custom.api.example.com/api/v2/oauth/token");
		const params = new URLSearchParams(capturedBody);
		expect(params.get("client_id")).toBe("my-id");
		expect(params.get("client_secret")).toBe("my-secret");
		expect(params.get("grant_type")).toBe("client_credentials");
	});

	it("throws on failed token request", async () => {
		const mockFetch = async () => new Response("Unauthorized", { status: 401 });

		const provider = new OAuthAuthProvider({
			clientId: "bad-id",
			clientSecret: "bad-secret",
			fetch: mockFetch as typeof fetch,
		});

		await expect(provider.getAuthHeaders()).rejects.toThrow(
			"OAuth token request failed with status 401",
		);
	});

	it("prevents concurrent token refreshes (mutex)", async () => {
		let callCount = 0;

		const mockFetch = async () => {
			callCount++;
			// Simulate network delay
			await new Promise((r) => setTimeout(r, 50));
			return new Response(JSON.stringify({ access_token: "tok", expires_in: 3600 }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const provider = new OAuthAuthProvider({
			clientId: "id",
			clientSecret: "secret",
			fetch: mockFetch as typeof fetch,
		});

		// Fire off 3 concurrent requests
		const results = await Promise.all([
			provider.getAuthHeaders(),
			provider.getAuthHeaders(),
			provider.getAuthHeaders(),
		]);

		// All should get the same token
		for (const r of results) {
			expect(r).toEqual({ Authorization: "Bearer tok" });
		}

		// Only one fetch call should have been made
		expect(callCount).toBe(1);
	});
});

import { describe, expect, it } from "bun:test";
import { TailscaleClient } from "../src/client.ts";
import { TailscaleError } from "../src/errors.ts";

describe("TailscaleClient", () => {
	it("creates a client with API key auth", () => {
		const client = new TailscaleClient({
			apiKey: "tskey-api-test",
			tailnet: "-",
			fetch: (() => {}) as unknown as typeof fetch,
		});
		expect(client.devices).toBeDefined();
		expect(client.keys).toBeDefined();
		expect(client.dns).toBeDefined();
		expect(client.policy).toBeDefined();
		expect(client.webhooks).toBeDefined();
	});

	it("creates a client with OAuth auth", () => {
		const client = new TailscaleClient({
			oauthClientId: "client-id",
			oauthClientSecret: "client-secret",
			tailnet: "-",
			fetch: (() => {}) as unknown as typeof fetch,
		});
		expect(client.devices).toBeDefined();
	});

	it("throws when both apiKey and OAuth are provided", () => {
		expect(
			() =>
				new TailscaleClient({
					apiKey: "tskey-api-test",
					oauthClientId: "client-id",
					oauthClientSecret: "client-secret",
					tailnet: "-",
				}),
		).toThrow("Provide either apiKey or oauthClientId/oauthClientSecret, not both.");
	});

	it("throws when no auth is provided", () => {
		expect(
			() =>
				new TailscaleClient({
					tailnet: "-",
				}),
		).toThrow("Authentication required");
	});

	it("throws when only oauthClientId is provided", () => {
		expect(
			() =>
				new TailscaleClient({
					oauthClientId: "client-id",
					tailnet: "-",
				}),
		).toThrow("Both oauthClientId and oauthClientSecret are required.");
	});

	it("uses the provided fetch implementation", async () => {
		let fetchCalled = false;
		const mockFetch = async () => {
			fetchCalled = true;
			return new Response(JSON.stringify({ devices: [] }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = new TailscaleClient({
			apiKey: "tskey-api-test",
			tailnet: "-",
			fetch: mockFetch as typeof fetch,
		});

		await client.devices.list();
		expect(fetchCalled).toBe(true);
	});
});

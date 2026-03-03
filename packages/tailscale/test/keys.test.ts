import { describe, expect, it } from "bun:test";
import { KeysResource } from "../src/resources/keys.ts";
import { createMockHttpClient } from "./helpers.ts";

const mockKey = {
	id: "kAAAA",
	key: "tskey-auth-kAAAA-abcdef",
	description: "CI key",
	created: "2024-01-01T00:00:00Z",
	expires: "2024-01-02T00:00:00Z",
	revoked: "0001-01-01T00:00:00Z",
	invalid: false,
	capabilities: {
		devices: {
			create: { reusable: false, ephemeral: true, preauthorized: true, tags: ["tag:ci"] },
		},
	},
	userId: "user-123",
};

describe("KeysResource", () => {
	it("lists keys", async () => {
		const { client } = createMockHttpClient([
			{ method: "GET", path: "/tailnet/-/keys", status: 200, body: { keys: [mockKey] } },
		]);

		const keys = new KeysResource(client, "-");
		const result = await keys.list();
		expect(result).toHaveLength(1);
		expect(result[0]?.id).toBe("kAAAA");
	});

	it("creates a key", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "POST", path: "/tailnet/-/keys", status: 200, body: mockKey },
		]);

		const keys = new KeysResource(client, "-");
		const result = await keys.create({
			capabilities: {
				devices: {
					create: { reusable: false, ephemeral: true, preauthorized: true, tags: ["tag:ci"] },
				},
			},
			expirySeconds: 86400,
			description: "CI key",
		});

		expect(result.key).toBe("tskey-auth-kAAAA-abcdef");
		expect(requests[0]?.body).toHaveProperty("capabilities");
	});

	it("gets a key by id", async () => {
		const { client } = createMockHttpClient([
			{ method: "GET", path: "/tailnet/-/keys/kAAAA", status: 200, body: mockKey },
		]);

		const keys = new KeysResource(client, "-");
		const result = await keys.get("kAAAA");
		expect(result.id).toBe("kAAAA");
	});

	it("deletes a key", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "DELETE", path: "/tailnet/-/keys/kAAAA", status: 200, body: {} },
		]);

		const keys = new KeysResource(client, "-");
		await keys.delete("kAAAA");
		expect(requests).toHaveLength(1);
		expect(requests[0]?.method).toBe("DELETE");
	});
});

import { describe, expect, it } from "bun:test";
import { WebhooksResource } from "../src/resources/webhooks.ts";
import { createMockHttpClient } from "./helpers.ts";

const mockWebhook = {
	endpointId: "ep-123",
	endpointUrl: "https://example.com/webhook",
	providerType: "" as const,
	creatorLoginName: "user@example.com",
	created: "2024-01-01T00:00:00Z",
	lastModified: "2024-01-01T00:00:00Z",
	subscriptions: ["nodeCreated" as const, "nodeDeleted" as const],
};

describe("WebhooksResource", () => {
	it("lists webhooks", async () => {
		const { client } = createMockHttpClient([
			{
				method: "GET",
				path: "/tailnet/-/webhooks",
				status: 200,
				body: { webhooks: [mockWebhook] },
			},
		]);

		const webhooks = new WebhooksResource(client, "-");
		const result = await webhooks.list();
		expect(result).toHaveLength(1);
		expect(result[0]?.endpointId).toBe("ep-123");
	});

	it("creates a webhook", async () => {
		const { client, requests } = createMockHttpClient([
			{
				method: "POST",
				path: "/tailnet/-/webhooks",
				status: 200,
				body: { ...mockWebhook, secret: "tswhk_secret_123" },
			},
		]);

		const webhooks = new WebhooksResource(client, "-");
		const result = await webhooks.create({
			endpointUrl: "https://example.com/webhook",
			providerType: "",
			subscriptions: ["nodeCreated"],
		});
		expect(result.secret).toBe("tswhk_secret_123");
		expect(requests[0]?.body).toHaveProperty("endpointUrl");
	});

	it("gets a webhook", async () => {
		const { client } = createMockHttpClient([
			{ method: "GET", path: "/webhooks/ep-123", status: 200, body: mockWebhook },
		]);

		const webhooks = new WebhooksResource(client, "-");
		const result = await webhooks.get("ep-123");
		expect(result.endpointUrl).toBe("https://example.com/webhook");
	});

	it("updates a webhook", async () => {
		const { client, requests } = createMockHttpClient([
			{
				method: "PATCH",
				path: "/webhooks/ep-123",
				status: 200,
				body: { ...mockWebhook, subscriptions: ["policyUpdate"] },
			},
		]);

		const webhooks = new WebhooksResource(client, "-");
		const result = await webhooks.update("ep-123", {
			subscriptions: ["policyUpdate"],
		});
		expect(requests[0]?.method).toBe("PATCH");
		expect(result.subscriptions).toEqual(["policyUpdate"]);
	});

	it("deletes a webhook", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "DELETE", path: "/webhooks/ep-123", status: 200, body: {} },
		]);

		const webhooks = new WebhooksResource(client, "-");
		await webhooks.delete("ep-123");
		expect(requests[0]?.method).toBe("DELETE");
	});

	it("tests a webhook", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "POST", path: "/webhooks/ep-123/test", status: 200, body: {} },
		]);

		const webhooks = new WebhooksResource(client, "-");
		await webhooks.test("ep-123");
		expect(requests[0]?.method).toBe("POST");
	});

	it("rotates a webhook secret", async () => {
		const { client } = createMockHttpClient([
			{
				method: "POST",
				path: "/webhooks/ep-123/rotate",
				status: 200,
				body: { ...mockWebhook, secret: "tswhk_new_secret" },
			},
		]);

		const webhooks = new WebhooksResource(client, "-");
		const result = await webhooks.rotateSecret("ep-123");
		expect(result.secret).toBe("tswhk_new_secret");
	});
});

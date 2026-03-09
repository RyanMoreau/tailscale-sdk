import { describe, expect, it } from "bun:test";
import { TailnetsResource } from "../src/resources/tailnets.ts";
import { createMockHttpClient } from "./helpers.ts";

const mockTailnetInfo = {
	name: "example.com",
	tailnetId: "tailnet-123",
	created: "2023-01-01T00:00:00Z",
	region: "us-east",
	maxDevices: null,
};

describe("TailnetsResource", () => {
	it("gets tailnet info", async () => {
		const { client } = createMockHttpClient([
			{
				method: "GET",
				path: "/tailnet/-",
				status: 200,
				body: mockTailnetInfo,
			},
		]);

		const tailnets = new TailnetsResource(client, "-");
		const result = await tailnets.info();
		expect(result.name).toBe("example.com");
		expect(result.tailnetId).toBe("tailnet-123");
	});

	it("gets tailnet settings", async () => {
		const { client } = createMockHttpClient([
			{
				method: "GET",
				path: "/tailnet/-/settings",
				status: 200,
				body: { magicDNS: true, deviceAutoApproval: false },
			},
		]);

		const tailnets = new TailnetsResource(client, "-");
		const result = await tailnets.getSettings();
		expect(result.magicDNS).toBe(true);
	});

	it("updates tailnet settings", async () => {
		const { client, requests } = createMockHttpClient([
			{
				method: "PATCH",
				path: "/tailnet/-/settings",
				status: 200,
				body: { magicDNS: false, deviceAutoApproval: true },
			},
		]);

		const tailnets = new TailnetsResource(client, "-");
		const result = await tailnets.setSettings({ deviceAutoApproval: true });
		expect(requests[0]?.body).toEqual({ deviceAutoApproval: true });
		expect(result.deviceAutoApproval).toBe(true);
	});

	it("gets tailnet membership", async () => {
		const { client } = createMockHttpClient([
			{
				method: "GET",
				path: "/tailnet/-/members",
				status: 200,
				body: {
					tailnetId: "tailnet-123",
					tailnetName: "example.com",
					currentUser: {
						userId: "user-1",
						loginName: "admin@example.com",
						role: "owner",
						created: "2023-01-01T00:00:00Z",
					},
					otherUsers: [],
					totalDevices: 5,
					totalUsers: 1,
				},
			},
		]);

		const tailnets = new TailnetsResource(client, "-");
		const result = await tailnets.membership();
		expect(result.totalDevices).toBe(5);
		expect(result.totalUsers).toBe(1);
	});
});

import { describe, expect, it } from "bun:test";
import { UsersResource } from "../src/resources/users.ts";
import { createMockHttpClient } from "./helpers.ts";

const mockUser = {
	id: "u-123",
	loginName: "ryan@example.com",
	displayName: "Ryan",
	tailnetRole: "owner",
	currentlyConnected: true,
	deviceCount: 4,
	type: "member",
};

describe("UsersResource", () => {
	it("lists users", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "GET", path: "/tailnet/-/users", status: 200, body: { users: [mockUser] } },
		]);

		const users = new UsersResource(client, "-");
		const result = await users.list();

		expect(result.users).toHaveLength(1);
		expect(result.users?.[0]?.loginName).toBe("ryan@example.com");
		expect(requests[0]?.method).toBe("GET");
		expect(requests[0]?.url).toContain("/tailnet/-/users");
	});

	it("returns an empty list when the tailnet has no users", async () => {
		const { client } = createMockHttpClient([
			{ method: "GET", path: "/tailnet/-/users", status: 200, body: {} },
		]);

		const users = new UsersResource(client, "-");
		const result = await users.list();

		expect(result.users ?? []).toHaveLength(0);
	});

	it("gets a single user by id", async () => {
		const { client, requests } = createMockHttpClient([
			{
				method: "GET",
				path: "/user/u-123",
				status: 200,
				body: { ...mockUser, devices: ["d1", "d2"] },
			},
		]);

		const users = new UsersResource(client, "-");
		const result = await users.get("u-123");

		expect(result.id).toBe("u-123");
		expect(result.devices).toEqual(["d1", "d2"]);
		expect(requests[0]?.url).toContain("/user/u-123");
	});

	it("scopes the list request to the configured tailnet", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "GET", path: "/tailnet/example.com/users", status: 200, body: { users: [] } },
		]);

		const users = new UsersResource(client, "example.com");
		await users.list();

		expect(requests[0]?.url).toContain("/tailnet/example.com/users");
	});

	it("throws on a non-2xx response", async () => {
		const { client } = createMockHttpClient([
			{ method: "GET", path: "/user/missing", status: 404, body: { message: "user not found" } },
		]);

		const users = new UsersResource(client, "-");

		await expect(users.get("missing")).rejects.toThrow();
	});
});

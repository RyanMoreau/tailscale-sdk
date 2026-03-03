import { describe, expect, it } from "bun:test";
import { DevicesResource } from "../src/resources/devices.ts";
import { createMockHttpClient } from "./helpers.ts";

const mockDevice = {
	id: "12345",
	nodeId: "nK1234",
	name: "my-device.tail12345.ts.net",
	addresses: ["100.64.0.1"],
	authorized: true,
	user: "user@example.com",
	tags: [],
	hostname: "my-device",
	os: "linux",
	created: "2024-01-01T00:00:00Z",
	expires: "2025-01-01T00:00:00Z",
	lastSeen: "2024-06-01T12:00:00Z",
	keyExpiryDisabled: false,
	blocksIncomingConnections: false,
	clientVersion: "1.50.0",
	isEphemeral: false,
	isExternal: false,
	connectedToControl: true,
	machineKey: "mkey:abc",
	nodeKey: "nodekey:abc",
	tailnetLockError: "",
	tailnetLockKey: "",
	updateAvailable: false,
	sshEnabled: false,
	advertisedRoutes: [],
	enabledRoutes: [],
	clientConnectivity: null,
	distro: null,
};

describe("DevicesResource", () => {
	it("lists devices", async () => {
		const { client } = createMockHttpClient([
			{
				method: "GET",
				path: "/tailnet/-/devices",
				status: 200,
				body: { devices: [mockDevice] },
			},
		]);

		const devices = new DevicesResource(client, "-");
		const result = await devices.list();
		expect(result).toHaveLength(1);
		expect(result[0]?.name).toBe("my-device.tail12345.ts.net");
	});

	it("gets a device by id", async () => {
		const { client } = createMockHttpClient([
			{ method: "GET", path: "/device/12345", status: 200, body: mockDevice },
		]);

		const devices = new DevicesResource(client, "-");
		const result = await devices.get("12345");
		expect(result.id).toBe("12345");
	});

	it("deletes a device", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "DELETE", path: "/device/12345", status: 200, body: {} },
		]);

		const devices = new DevicesResource(client, "-");
		await devices.delete("12345");
		expect(requests).toHaveLength(1);
		expect(requests[0]?.method).toBe("DELETE");
	});

	it("authorizes a device", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "POST", path: "/device/12345/authorized", status: 200, body: {} },
		]);

		const devices = new DevicesResource(client, "-");
		await devices.authorize("12345", true);
		expect(requests[0]?.body).toEqual({ authorized: true });
	});

	it("sets device tags", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "POST", path: "/device/12345/tags", status: 200, body: {} },
		]);

		const devices = new DevicesResource(client, "-");
		await devices.setTags("12345", ["tag:server"]);
		expect(requests[0]?.body).toEqual({ tags: ["tag:server"] });
	});

	it("sets device name", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "POST", path: "/device/12345/name", status: 200, body: {} },
		]);

		const devices = new DevicesResource(client, "-");
		await devices.setName("12345", "new-name");
		expect(requests[0]?.body).toEqual({ name: "new-name" });
	});

	it("sets device key", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "POST", path: "/device/12345/key", status: 200, body: {} },
		]);

		const devices = new DevicesResource(client, "-");
		await devices.setKey("12345", { keyExpiryDisabled: true });
		expect(requests[0]?.body).toEqual({ keyExpiryDisabled: true });
	});

	it("gets device routes", async () => {
		const { client } = createMockHttpClient([
			{
				method: "GET",
				path: "/device/12345/routes",
				status: 200,
				body: { advertisedRoutes: ["10.0.0.0/24"], enabledRoutes: ["10.0.0.0/24"] },
			},
		]);

		const devices = new DevicesResource(client, "-");
		const routes = await devices.getRoutes("12345");
		expect(routes.advertisedRoutes).toEqual(["10.0.0.0/24"]);
		expect(routes.enabledRoutes).toEqual(["10.0.0.0/24"]);
	});

	it("sets device routes", async () => {
		const { client, requests } = createMockHttpClient([
			{
				method: "POST",
				path: "/device/12345/routes",
				status: 200,
				body: { advertisedRoutes: ["10.0.0.0/24"], enabledRoutes: ["10.0.0.0/24"] },
			},
		]);

		const devices = new DevicesResource(client, "-");
		const routes = await devices.setRoutes("12345", ["10.0.0.0/24"]);
		expect(requests[0]?.body).toEqual({ routes: ["10.0.0.0/24"] });
		expect(routes.enabledRoutes).toEqual(["10.0.0.0/24"]);
	});
});

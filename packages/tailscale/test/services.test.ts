import { describe, expect, it } from "bun:test";
import { ServicesResource } from "../src/resources/services.ts";
import { createMockHttpClient } from "./helpers.ts";

const mockService = {
	id: "svc-123",
	resource: {
		name: "svc:database",
		description: "PostgreSQL database",
		tailVip: "100.100.0.1",
	},
	endpoints: {
		"tcp:5432": { protocol: "tcp", port: 5432, target: "localhost:5432" },
	},
	backendHosts: [{ nodeId: "node-456", hostname: "db-server" }],
	created: "2024-01-01T00:00:00Z",
	lastModified: "2024-01-01T00:00:00Z",
	createdBy: "user@example.com",
};

describe("ServicesResource", () => {
	it("lists services", async () => {
		const { client } = createMockHttpClient([
			{
				method: "GET",
				path: "/tailnet/-/services",
				status: 200,
				body: { services: [mockService] },
			},
		]);

		const services = new ServicesResource(client, "-");
		const result = await services.list();
		expect(result).toHaveLength(1);
		expect(result[0]?.id).toBe("svc-123");
	});

	it("gets a service by id", async () => {
		const { client } = createMockHttpClient([
			{ method: "GET", path: "/services/svc-123", status: 200, body: mockService },
		]);

		const services = new ServicesResource(client, "-");
		const result = await services.get("svc-123");
		expect(result.resource.name).toBe("svc:database");
	});

	it("creates a service", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "POST", path: "/tailnet/-/services", status: 200, body: mockService },
		]);

		const services = new ServicesResource(client, "-");
		const result = await services.create({
			resource: mockService.resource,
			endpoints: mockService.endpoints,
			backendHosts: mockService.backendHosts,
		});
		expect(result.id).toBe("svc-123");
		expect(requests[0]?.body).toHaveProperty("resource");
	});

	it("updates a service", async () => {
		const updatedService = {
			...mockService,
			resource: { ...mockService.resource, description: "Updated" },
		};
		const { client, requests } = createMockHttpClient([
			{ method: "PATCH", path: "/services/svc-123", status: 200, body: updatedService },
		]);

		const services = new ServicesResource(client, "-");
		const result = await services.update("svc-123", { resource: { description: "Updated" } });
		expect(result.resource.description).toBe("Updated");
		expect(requests[0]?.body).toHaveProperty("resource");
	});

	it("deletes a service", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "DELETE", path: "/services/svc-123", status: 200, body: {} },
		]);

		const services = new ServicesResource(client, "-");
		await services.delete("svc-123");
		expect(requests[0]?.method).toBe("DELETE");
	});
});

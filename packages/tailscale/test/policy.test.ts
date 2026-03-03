import { describe, expect, it } from "bun:test";
import { PolicyResource } from "../src/resources/policy.ts";
import { createMockHttpClient } from "./helpers.ts";

const mockPolicy = {
	acls: [{ action: "accept", src: ["*"], dst: ["*:*"] }],
	groups: { "group:admin": ["user@example.com"] },
};

describe("PolicyResource", () => {
	it("gets the policy file with ETag", async () => {
		const { client } = createMockHttpClient([
			{
				method: "GET",
				path: "/tailnet/-/acl",
				status: 200,
				body: mockPolicy,
				headers: { ETag: '"etag-abc"' },
			},
		]);

		const policy = new PolicyResource(client, "-");
		const result = await policy.get();
		expect(result.policy.acls).toHaveLength(1);
		expect(result.etag).toBe('"etag-abc"');
	});

	it("gets raw HuJSON policy", async () => {
		const { client, requests } = createMockHttpClient([
			{
				method: "GET",
				path: "/tailnet/-/acl",
				status: 200,
				body: '{ "acls": [] }',
				headers: { ETag: '"etag-123"', "Content-Type": "text/plain" },
			},
		]);

		const policy = new PolicyResource(client, "-");
		const result = await policy.getRaw();
		expect(result.etag).toBe('"etag-123"');
		expect(requests[0]?.headers.Accept).toBe("text/plain");
	});

	it("sets the policy file with If-Match header", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "POST", path: "/tailnet/-/acl", status: 200, body: {} },
		]);

		const policy = new PolicyResource(client, "-");
		await policy.set(mockPolicy, '"etag-abc"');
		expect(requests[0]?.headers["If-Match"]).toBe('"etag-abc"');
		expect(requests[0]?.body).toEqual(mockPolicy);
	});

	it("validates a policy", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "POST", path: "/tailnet/-/acl/validate", status: 200, body: {} },
		]);

		const policy = new PolicyResource(client, "-");
		await policy.validate(mockPolicy);
		expect(requests[0]?.body).toEqual(mockPolicy);
	});
});

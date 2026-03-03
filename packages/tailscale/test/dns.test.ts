import { describe, expect, it } from "bun:test";
import { DnsResource } from "../src/resources/dns.ts";
import { createMockHttpClient } from "./helpers.ts";

describe("DnsResource", () => {
	it("gets nameservers", async () => {
		const { client } = createMockHttpClient([
			{
				method: "GET",
				path: "/tailnet/-/dns/nameservers",
				status: 200,
				body: { dns: ["8.8.8.8", "1.1.1.1"] },
			},
		]);

		const dns = new DnsResource(client, "-");
		const result = await dns.getNameservers();
		expect(result).toEqual(["8.8.8.8", "1.1.1.1"]);
	});

	it("sets nameservers", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "POST", path: "/tailnet/-/dns/nameservers", status: 200, body: {} },
		]);

		const dns = new DnsResource(client, "-");
		await dns.setNameservers(["8.8.8.8"]);
		expect(requests[0]?.body).toEqual({ dns: ["8.8.8.8"] });
	});

	it("gets search paths", async () => {
		const { client } = createMockHttpClient([
			{
				method: "GET",
				path: "/tailnet/-/dns/searchpaths",
				status: 200,
				body: { searchPaths: ["example.com"] },
			},
		]);

		const dns = new DnsResource(client, "-");
		const result = await dns.getSearchPaths();
		expect(result).toEqual(["example.com"]);
	});

	it("sets search paths", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "POST", path: "/tailnet/-/dns/searchpaths", status: 200, body: {} },
		]);

		const dns = new DnsResource(client, "-");
		await dns.setSearchPaths(["example.com"]);
		expect(requests[0]?.body).toEqual({ searchPaths: ["example.com"] });
	});

	it("gets DNS preferences", async () => {
		const { client } = createMockHttpClient([
			{
				method: "GET",
				path: "/tailnet/-/dns/preferences",
				status: 200,
				body: { magicDNS: true },
			},
		]);

		const dns = new DnsResource(client, "-");
		const result = await dns.getPreferences();
		expect(result.magicDNS).toBe(true);
	});

	it("sets DNS preferences", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "POST", path: "/tailnet/-/dns/preferences", status: 200, body: {} },
		]);

		const dns = new DnsResource(client, "-");
		await dns.setPreferences({ magicDNS: true });
		expect(requests[0]?.body).toEqual({ magicDNS: true });
	});

	it("gets split DNS config", async () => {
		const { client } = createMockHttpClient([
			{
				method: "GET",
				path: "/tailnet/-/dns/split-dns",
				status: 200,
				body: { "example.com": ["1.1.1.1"] },
			},
		]);

		const dns = new DnsResource(client, "-");
		const result = await dns.getSplitDns();
		expect(result["example.com"]).toEqual(["1.1.1.1"]);
	});

	it("sets split DNS config (PUT)", async () => {
		const { client, requests } = createMockHttpClient([
			{ method: "PUT", path: "/tailnet/-/dns/split-dns", status: 200, body: {} },
		]);

		const dns = new DnsResource(client, "-");
		await dns.setSplitDns({ "example.com": ["1.1.1.1"] });
		expect(requests[0]?.method).toBe("PUT");
		expect(requests[0]?.body).toEqual({ "example.com": ["1.1.1.1"] });
	});

	it("updates split DNS config (PATCH)", async () => {
		const { client, requests } = createMockHttpClient([
			{
				method: "PATCH",
				path: "/tailnet/-/dns/split-dns",
				status: 200,
				body: { "example.com": ["1.1.1.1", "8.8.8.8"] },
			},
		]);

		const dns = new DnsResource(client, "-");
		const result = await dns.updateSplitDns({ "example.com": ["1.1.1.1", "8.8.8.8"] });
		expect(requests[0]?.method).toBe("PATCH");
		expect(result["example.com"]).toEqual(["1.1.1.1", "8.8.8.8"]);
	});
});

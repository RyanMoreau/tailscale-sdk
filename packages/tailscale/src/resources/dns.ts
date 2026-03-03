import type { HttpClient } from "../http.ts";
import type {
	DNSNameservers,
	DNSPreferences,
	DNSSearchPaths,
	SplitDNSConfig,
} from "../types/dns.ts";

export class DnsResource {
	constructor(
		private readonly http: HttpClient,
		private readonly tailnet: string,
	) {}

	async getNameservers(): Promise<string[]> {
		const response = await this.http.request<DNSNameservers>(
			"GET",
			`/tailnet/${this.tailnet}/dns/nameservers`,
		);
		return response.data.dns;
	}

	async setNameservers(nameservers: string[]): Promise<void> {
		await this.http.request("POST", `/tailnet/${this.tailnet}/dns/nameservers`, {
			body: { dns: nameservers },
		});
	}

	async getSearchPaths(): Promise<string[]> {
		const response = await this.http.request<DNSSearchPaths>(
			"GET",
			`/tailnet/${this.tailnet}/dns/searchpaths`,
		);
		return response.data.searchPaths;
	}

	async setSearchPaths(searchPaths: string[]): Promise<void> {
		await this.http.request("POST", `/tailnet/${this.tailnet}/dns/searchpaths`, {
			body: { searchPaths },
		});
	}

	async getPreferences(): Promise<DNSPreferences> {
		const response = await this.http.request<DNSPreferences>(
			"GET",
			`/tailnet/${this.tailnet}/dns/preferences`,
		);
		return response.data;
	}

	async setPreferences(preferences: DNSPreferences): Promise<void> {
		await this.http.request("POST", `/tailnet/${this.tailnet}/dns/preferences`, {
			body: preferences,
		});
	}

	async getSplitDns(): Promise<SplitDNSConfig> {
		const response = await this.http.request<SplitDNSConfig>(
			"GET",
			`/tailnet/${this.tailnet}/dns/split-dns`,
		);
		return response.data;
	}

	async setSplitDns(config: SplitDNSConfig): Promise<void> {
		await this.http.request("PUT", `/tailnet/${this.tailnet}/dns/split-dns`, {
			body: config,
		});
	}

	async updateSplitDns(config: SplitDNSConfig): Promise<SplitDNSConfig> {
		const response = await this.http.request<SplitDNSConfig>(
			"PATCH",
			`/tailnet/${this.tailnet}/dns/split-dns`,
			{ body: config },
		);
		return response.data;
	}
}

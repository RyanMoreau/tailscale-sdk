import type { HttpClient } from "../http.ts";
import type { PolicyFile, PolicyGetResponse, PolicyRawResponse } from "../types/policy.ts";

export class PolicyResource {
	constructor(
		private readonly http: HttpClient,
		private readonly tailnet: string,
	) {}

	async get(): Promise<PolicyGetResponse> {
		const response = await this.http.request<PolicyFile>("GET", `/tailnet/${this.tailnet}/acl`);
		const etag = response.headers.get("etag") ?? "";
		return { policy: response.data, etag };
	}

	async getRaw(): Promise<PolicyRawResponse> {
		const response = await this.http.request<string>("GET", `/tailnet/${this.tailnet}/acl`, {
			headers: { Accept: "text/plain" },
		});
		const etag = response.headers.get("etag") ?? "";
		return { hujson: response.data, etag };
	}

	async set(policy: PolicyFile, etag: string): Promise<void> {
		await this.http.request("POST", `/tailnet/${this.tailnet}/acl`, {
			body: policy,
			headers: { "If-Match": etag },
		});
	}

	async validate(policy: PolicyFile): Promise<void> {
		await this.http.request("POST", `/tailnet/${this.tailnet}/acl/validate`, {
			body: policy,
		});
	}
}

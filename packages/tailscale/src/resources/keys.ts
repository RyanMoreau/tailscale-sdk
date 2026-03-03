import type { HttpClient } from "../http.ts";
import type { CreateKeyRequest, Key } from "../types/key.ts";

export class KeysResource {
	constructor(
		private readonly http: HttpClient,
		private readonly tailnet: string,
	) {}

	async list(): Promise<Key[]> {
		const response = await this.http.request<{ keys: Key[] }>(
			"GET",
			`/tailnet/${this.tailnet}/keys`,
		);
		return response.data.keys;
	}

	async create(request: CreateKeyRequest): Promise<Key> {
		const response = await this.http.request<Key>("POST", `/tailnet/${this.tailnet}/keys`, {
			body: request,
		});
		return response.data;
	}

	async get(keyId: string): Promise<Key> {
		const response = await this.http.request<Key>("GET", `/tailnet/${this.tailnet}/keys/${keyId}`);
		return response.data;
	}

	async delete(keyId: string): Promise<void> {
		await this.http.request("DELETE", `/tailnet/${this.tailnet}/keys/${keyId}`);
	}
}

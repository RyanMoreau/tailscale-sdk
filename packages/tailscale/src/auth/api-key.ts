import type { AuthProvider } from "./types.ts";

export class ApiKeyAuthProvider implements AuthProvider {
	private readonly encoded: string;

	constructor(apiKey: string) {
		this.encoded = btoa(`${apiKey}:`);
	}

	async getAuthHeaders(): Promise<Record<string, string>> {
		return { Authorization: `Basic ${this.encoded}` };
	}
}

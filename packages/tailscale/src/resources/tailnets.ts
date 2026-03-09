import type { HttpClient } from "../http.ts";
import type { TailnetInfo, TailnetMembership, TailnetSettings } from "../types/services.ts";

export class TailnetsResource {
	constructor(
		private readonly http: HttpClient,
		private readonly tailnet: string,
	) {}

	/**
	 * Get information about the current tailnet.
	 */
	async info(): Promise<TailnetInfo> {
		const response = await this.http.request<TailnetInfo>("GET", `/tailnet/${this.tailnet}`);
		return response.data;
	}

	/**
	 * Get current tailnet membership (users, devices, etc).
	 */
	async membership(): Promise<TailnetMembership> {
		const response = await this.http.request<TailnetMembership>(
			"GET",
			`/tailnet/${this.tailnet}/members`,
		);
		return response.data;
	}

	/**
	 * Get tailnet settings.
	 */
	async getSettings(): Promise<TailnetSettings> {
		const response = await this.http.request<TailnetSettings>(
			"GET",
			`/tailnet/${this.tailnet}/settings`,
		);
		return response.data;
	}

	/**
	 * Update tailnet settings.
	 */
	async setSettings(settings: Partial<TailnetSettings>): Promise<TailnetSettings> {
		const response = await this.http.request<TailnetSettings>(
			"PATCH",
			`/tailnet/${this.tailnet}/settings`,
			{ body: settings },
		);
		return response.data;
	}
}

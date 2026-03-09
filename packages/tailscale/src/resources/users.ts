import type { HttpClient } from "../http.ts";
import type { UserGetResponse, UsersListResponse } from "../types/users.ts";

export class UsersResource {
	constructor(
		private readonly http: HttpClient,
		private readonly tailnet: string,
	) {}

	async list(): Promise<UsersListResponse> {
		const response = await this.http.request<UsersListResponse>(
			"GET",
			`/tailnet/${this.tailnet}/users`,
		);
		return response.data;
	}

	async get(userId: string): Promise<UserGetResponse> {
		const response = await this.http.request<UserGetResponse>("GET", `/user/${userId}`);
		return response.data;
	}
}

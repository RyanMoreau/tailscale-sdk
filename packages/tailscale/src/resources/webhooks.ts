import type { HttpClient } from "../http.ts";
import type { CreateWebhookRequest, UpdateWebhookRequest, Webhook } from "../types/webhook.ts";

export class WebhooksResource {
	constructor(
		private readonly http: HttpClient,
		private readonly tailnet: string,
	) {}

	async list(): Promise<Webhook[]> {
		const response = await this.http.request<{ webhooks: Webhook[] }>(
			"GET",
			`/tailnet/${this.tailnet}/webhooks`,
		);
		return response.data.webhooks;
	}

	async create(request: CreateWebhookRequest): Promise<Webhook> {
		const response = await this.http.request<Webhook>("POST", `/tailnet/${this.tailnet}/webhooks`, {
			body: request,
		});
		return response.data;
	}

	async get(endpointId: string): Promise<Webhook> {
		const response = await this.http.request<Webhook>("GET", `/webhooks/${endpointId}`);
		return response.data;
	}

	async update(endpointId: string, request: UpdateWebhookRequest): Promise<Webhook> {
		const response = await this.http.request<Webhook>("PATCH", `/webhooks/${endpointId}`, {
			body: request,
		});
		return response.data;
	}

	async delete(endpointId: string): Promise<void> {
		await this.http.request("DELETE", `/webhooks/${endpointId}`);
	}

	async test(endpointId: string): Promise<void> {
		await this.http.request("POST", `/webhooks/${endpointId}/test`);
	}

	async rotateSecret(endpointId: string): Promise<Webhook> {
		const response = await this.http.request<Webhook>("POST", `/webhooks/${endpointId}/rotate`);
		return response.data;
	}
}

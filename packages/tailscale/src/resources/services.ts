import type { HttpClient } from "../http.ts";
import type { CreateServiceRequest, Service, UpdateServiceRequest } from "../types/services.ts";

export class ServicesResource {
	constructor(
		private readonly http: HttpClient,
		private readonly tailnet: string,
	) {}

	/**
	 * List all services in the tailnet.
	 */
	async list(): Promise<Service[]> {
		const response = await this.http.request<{ services: Service[] }>(
			"GET",
			`/tailnet/${this.tailnet}/services`,
		);
		return response.data.services;
	}

	/**
	 * Get a specific service by ID.
	 */
	async get(serviceId: string): Promise<Service> {
		const response = await this.http.request<Service>("GET", `/services/${serviceId}`);
		return response.data;
	}

	/**
	 * Create a new service.
	 */
	async create(request: CreateServiceRequest): Promise<Service> {
		const response = await this.http.request<Service>("POST", `/tailnet/${this.tailnet}/services`, {
			body: request,
		});
		return response.data;
	}

	/**
	 * Update an existing service.
	 */
	async update(serviceId: string, request: UpdateServiceRequest): Promise<Service> {
		const response = await this.http.request<Service>("PATCH", `/services/${serviceId}`, {
			body: request,
		});
		return response.data;
	}

	/**
	 * Delete a service.
	 */
	async delete(serviceId: string): Promise<void> {
		await this.http.request("DELETE", `/services/${serviceId}`);
	}
}

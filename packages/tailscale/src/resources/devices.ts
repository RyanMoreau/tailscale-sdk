import type { HttpClient } from "../http.ts";
import type { Device, DeviceRoutes, SetDeviceKeyRequest } from "../types/device.ts";

export class DevicesResource {
	constructor(
		private readonly http: HttpClient,
		private readonly tailnet: string,
	) {}

	async list(): Promise<Device[]> {
		const response = await this.http.request<{ devices: Device[] }>(
			"GET",
			`/tailnet/${this.tailnet}/devices`,
		);
		return response.data.devices;
	}

	async get(deviceId: string): Promise<Device> {
		const response = await this.http.request<Device>("GET", `/device/${deviceId}`);
		return response.data;
	}

	async delete(deviceId: string): Promise<void> {
		await this.http.request("DELETE", `/device/${deviceId}`);
	}

	async authorize(deviceId: string, authorized: boolean): Promise<void> {
		await this.http.request("POST", `/device/${deviceId}/authorized`, {
			body: { authorized },
		});
	}

	async setTags(deviceId: string, tags: string[]): Promise<void> {
		await this.http.request("POST", `/device/${deviceId}/tags`, {
			body: { tags },
		});
	}

	async setName(deviceId: string, name: string): Promise<void> {
		await this.http.request("POST", `/device/${deviceId}/name`, {
			body: { name },
		});
	}

	async setKey(deviceId: string, opts: SetDeviceKeyRequest): Promise<void> {
		await this.http.request("POST", `/device/${deviceId}/key`, {
			body: opts,
		});
	}

	async getRoutes(deviceId: string): Promise<DeviceRoutes> {
		const response = await this.http.request<DeviceRoutes>("GET", `/device/${deviceId}/routes`);
		return response.data;
	}

	async setRoutes(deviceId: string, routes: string[]): Promise<DeviceRoutes> {
		const response = await this.http.request<DeviceRoutes>("POST", `/device/${deviceId}/routes`, {
			body: { routes },
		});
		return response.data;
	}
}

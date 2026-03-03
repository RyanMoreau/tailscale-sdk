import type { ISODateString } from "./common.ts";

export interface KeyCapabilities {
	devices: {
		create: {
			reusable: boolean;
			ephemeral: boolean;
			preauthorized: boolean;
			tags: string[];
		};
	};
}

export interface CreateKeyRequest {
	capabilities: KeyCapabilities;
	expirySeconds?: number;
	description?: string;
}

export interface Key {
	id: string;
	key: string;
	description: string;
	created: ISODateString;
	expires: ISODateString;
	revoked: ISODateString;
	invalid: boolean;
	capabilities: KeyCapabilities;
	userId: string;
}

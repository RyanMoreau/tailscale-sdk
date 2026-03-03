import type { ISODateString } from "./common.ts";

export interface ClientSupports {
	hairPinning: boolean;
	ipv6: boolean;
	pcp: boolean;
	pmp: boolean;
	udp: boolean;
	upnp: boolean;
}

export interface DERPRegion {
	preferred: boolean;
	latencyMs: number;
}

export interface ClientConnectivity {
	endpoints: string[];
	derp: string;
	mappingVariesByDestIP: boolean;
	latency: Record<string, DERPRegion>;
	clientSupports: ClientSupports;
}

export interface Distro {
	name: string;
	version: string;
	codeName: string;
}

export interface Device {
	addresses: string[];
	name: string;
	id: string;
	nodeId: string;
	authorized: boolean;
	user: string;
	tags: string[];
	keyExpiryDisabled: boolean;
	blocksIncomingConnections: boolean;
	clientVersion: string;
	created: ISODateString;
	expires: ISODateString;
	hostname: string;
	isEphemeral: boolean;
	isExternal: boolean;
	connectedToControl: boolean;
	lastSeen: ISODateString | null;
	machineKey: string;
	nodeKey: string;
	os: string;
	tailnetLockError: string;
	tailnetLockKey: string;
	updateAvailable: boolean;
	sshEnabled: boolean;
	/**
	 * @see {@link file://./../../src/spec-overrides.ts} — The OpenAPI spec uses `AdvertisedRoutes`
	 * (PascalCase) but the actual API returns `advertisedRoutes` (camelCase).
	 */
	advertisedRoutes: string[];
	enabledRoutes: string[];
	clientConnectivity: ClientConnectivity | null;
	distro: Distro | null;
}

export interface DeviceRoutes {
	/** @see spec-overrides.ts — API returns `advertisedRoutes`, not `AdvertisedRoutes`. */
	advertisedRoutes: string[];
	enabledRoutes: string[];
}

export interface SetDeviceKeyRequest {
	keyExpiryDisabled: boolean;
}

// ============================================================================
// Services Types
// ============================================================================

import type { ISODateString } from "./common.ts";

export type ServiceProtocol = "tcp" | "http" | "https";

export interface ServiceEndpoint {
	protocol: ServiceProtocol;
	port: number | string; // Can be "8080" or "8080-8090"
	target: string; // Local target, e.g., "http://localhost:3000" or "localhost:5432"
}

export interface ServiceBackendHost {
	nodeId: string;
	hostname?: string;
}

export interface ServiceResource {
	/** MagicDNS name for the service (e.g., "svc:database", "svc:api") */
	name: string;
	description?: string;
	/** Tailscale Virtual IP address (e.g., "100.100.0.1") */
	tailVip?: string;
}

export interface Service {
	id: string;
	resource: ServiceResource;
	/** Map of endpoints for this service */
	endpoints: Record<string, ServiceEndpoint>;
	backendHosts: ServiceBackendHost[];
	created: ISODateString;
	lastModified: ISODateString;
	createdBy: string;
}

export interface CreateServiceRequest {
	resource: ServiceResource;
	endpoints: Record<string, ServiceEndpoint>;
	backendHosts: ServiceBackendHost[];
}

export interface UpdateServiceRequest {
	resource?: Partial<ServiceResource>;
	endpoints?: Record<string, ServiceEndpoint>;
	backendHosts?: ServiceBackendHost[];
}

// ============================================================================
// Tailnets Types
// ============================================================================

export interface TailnetInfo {
	/** Tailnet name (e.g., "example.com" or "-" for default) */
	name: string;
	/** Tailnet ID */
	tailnetId: string;
	created: ISODateString;
	/** Regional delivery preference */
	region?: string;
	/** Max devices allowed (null = unlimited) */
	maxDevices?: number | null;
}

export interface AutoApprovers {
	/** Auto-approve exit nodes: { "tag:exit": ["tag:user"] } */
	exitNode?: Record<string, string[]>;
	/** Auto-approve routes: { "10.0.0.0/24": ["group:ops"] } */
	routes?: Record<string, string[]>;
	/** Auto-approve services: { "tag:database": ["tag:app"] } */
	services?: Record<string, string[]>;
}

export interface TailnetSettings {
	/** Enable MagicDNS for this tailnet */
	magicDNS?: boolean;
	/** Enable device auto-approval */
	deviceAutoApproval?: boolean;
	/** Auto-approval rules */
	autoApprovers?: AutoApprovers;
	/** Default device key expiry in seconds (null = no expiry) */
	defaultDeviceKeyExpiry?: number | null;
	/** Allow local network access from exit nodes */
	localNetworkAccess?: boolean;
}

export interface TailnetUser {
	userId: string;
	loginName: string;
	displayName?: string;
	role: "owner" | "admin" | "it-admin" | "network-admin" | "member";
	created: ISODateString;
}

export interface TailnetMembership {
	tailnetId: string;
	tailnetName: string;
	currentUser: TailnetUser;
	otherUsers: TailnetUser[];
	totalDevices: number;
	totalUsers: number;
}

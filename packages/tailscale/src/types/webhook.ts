import type { ISODateString } from "./common.ts";

export type WebhookProviderType = "slack" | "mattermost" | "googlechat" | "discord" | "";

export type WebhookSubscriptionType =
	| "nodeCreated"
	| "nodeApproved"
	| "nodeNeedsApproval"
	| "nodeSigned"
	| "nodeNeedsSignature"
	| "nodeKeyExpired"
	| "nodeKeyExpiringInOneDay"
	| "nodeDeleted"
	| "policyUpdate"
	| "userCreated"
	| "userApproved"
	| "userNeedsApproval"
	| "userRoleUpdated"
	| "subnetIPForwardingNotEnabled"
	| "exitNodeIPForwardingNotEnabled"
	| "test"
	| "webhookUpdated"
	| "webhookDeleted";

export interface Webhook {
	endpointId: string;
	/** @see spec-overrides.ts — API returns `endpointUrl` (camelCase), not `endpoint_url`. */
	endpointUrl: string;
	providerType: WebhookProviderType;
	creatorLoginName: string;
	created: ISODateString;
	lastModified: ISODateString;
	subscriptions: WebhookSubscriptionType[];
	secret?: string;
}

export interface CreateWebhookRequest {
	endpointUrl: string;
	providerType: WebhookProviderType;
	subscriptions: WebhookSubscriptionType[];
}

export interface UpdateWebhookRequest {
	subscriptions: WebhookSubscriptionType[];
}

export interface WebhookEvent {
	timestamp: ISODateString;
	version: number;
	type: WebhookSubscriptionType;
	tailnet: string;
	message: string;
	data?: Record<string, unknown>;
}

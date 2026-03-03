export { TailscaleClient } from "./client.ts";
export type { TailscaleClientOptions } from "./client.ts";

export { TailscaleApiError, TailscaleError } from "./errors.ts";

export type { AuthProvider } from "./auth/types.ts";
export { ApiKeyAuthProvider } from "./auth/api-key.ts";
export { OAuthAuthProvider } from "./auth/oauth.ts";

export type {
	ClientConnectivity,
	ClientSupports,
	CreateKeyRequest,
	CreateWebhookRequest,
	DERPRegion,
	Device,
	DeviceRoutes,
	Distro,
	DNSNameservers,
	DNSPreferences,
	DNSSearchPaths,
	ISODateString,
	Key,
	KeyCapabilities,
	ACLAutoApprovers,
	ACLEntry,
	ACLSSHRule,
	ACLTest,
	NodeAttrGrant,
	PolicyFile,
	PolicyGetResponse,
	PolicyRawResponse,
	SetDeviceKeyRequest,
	SplitDNSConfig,
	UpdateWebhookRequest,
	Webhook,
	WebhookEvent,
	WebhookProviderType,
	WebhookSubscriptionType,
} from "./types/index.ts";

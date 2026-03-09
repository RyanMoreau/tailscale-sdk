export type { ISODateString } from "./common.ts";

export type {
	ClientConnectivity,
	ClientSupports,
	DERPRegion,
	Device,
	DeviceRoutes,
	Distro,
	SetDeviceKeyRequest,
} from "./device.ts";
export type { DNSNameservers, DNSPreferences, DNSSearchPaths, SplitDNSConfig } from "./dns.ts";
export type { CreateKeyRequest, Key, KeyCapabilities } from "./key.ts";

export type {
	ACLAutoApprovers,
	ACLEntry,
	ACLSSHRule,
	ACLTest,
	NodeAttrGrant,
	PolicyFile,
	PolicyGetResponse,
	PolicyRawResponse,
} from "./policy.ts";
export type {
	AutoApprovers,
	CreateServiceRequest,
	Service,
	ServiceBackendHost,
	ServiceEndpoint,
	ServiceProtocol,
	ServiceResource,
	TailnetInfo,
	TailnetMembership,
	TailnetSettings,
	TailnetUser,
	UpdateServiceRequest,
} from "./services.ts";
export type {
	User,
	UserGetResponse,
	UsersListResponse,
} from "./users.ts";
export type {
	CreateWebhookRequest,
	UpdateWebhookRequest,
	Webhook,
	WebhookEvent,
	WebhookProviderType,
	WebhookSubscriptionType,
} from "./webhook.ts";

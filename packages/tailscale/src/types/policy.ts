export interface ACLEntry {
	action: string;
	ports?: string[];
	users?: string[];
	src?: string[];
	dst?: string[];
	proto?: string;
}

export interface ACLAutoApprovers {
	routes?: Record<string, string[]>;
	exitNode?: string[];
}

export interface ACLTest {
	user?: string;
	allow?: string[];
	deny?: string[];
	src?: string;
	accept?: string[];
}

export interface ACLSSHRule {
	action: string;
	users: string[];
	src: string[];
	dst: string[];
	checkPeriod?: string;
}

export interface NodeAttrGrant {
	target: string[];
	attr?: string[];
	app?: Record<string, unknown[]>;
}

export interface PolicyFile {
	acls?: ACLEntry[];
	autoApprovers?: ACLAutoApprovers;
	groups?: Record<string, string[]>;
	hosts?: Record<string, string>;
	tagOwners?: Record<string, string[]>;
	tests?: ACLTest[];
	ssh?: ACLSSHRule[];
	nodeAttrs?: NodeAttrGrant[];
	grants?: unknown[];
	[key: string]: unknown;
}

export interface PolicyGetResponse {
	policy: PolicyFile;
	etag: string;
}

export interface PolicyRawResponse {
	hujson: string;
	etag: string;
}

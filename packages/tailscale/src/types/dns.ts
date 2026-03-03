export interface DNSNameservers {
	dns: string[];
}

export interface DNSSearchPaths {
	searchPaths: string[];
}

export interface DNSPreferences {
	magicDNS: boolean;
}

/** Map of domain → nameserver addresses. */
export type SplitDNSConfig = Record<string, string[]>;

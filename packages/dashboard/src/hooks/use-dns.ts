import { useQuery } from "@tanstack/react-query";

export interface DNSPreferences {
	magicDNS: boolean;
}

export type SplitDNSConfig = Record<string, string[]>;

export function useNameservers() {
	return useQuery<string[]>({
		queryKey: ["dns", "nameservers"],
		queryFn: async () => {
			const res = await fetch("/api/dns/nameservers");
			if (!res.ok) throw new Error(await res.text());
			return res.json();
		},
		refetchInterval: 300_000,
	});
}

export function useSearchPaths() {
	return useQuery<string[]>({
		queryKey: ["dns", "searchpaths"],
		queryFn: async () => {
			const res = await fetch("/api/dns/searchpaths");
			if (!res.ok) throw new Error(await res.text());
			return res.json();
		},
		refetchInterval: 300_000,
	});
}

export function useSplitDns() {
	return useQuery<SplitDNSConfig>({
		queryKey: ["dns", "split"],
		queryFn: async () => {
			const res = await fetch("/api/dns/split");
			if (!res.ok) throw new Error(await res.text());
			return res.json();
		},
		refetchInterval: 300_000,
	});
}

export function useDnsPreferences() {
	return useQuery<DNSPreferences>({
		queryKey: ["dns", "preferences"],
		queryFn: async () => {
			const res = await fetch("/api/dns/preferences");
			if (!res.ok) throw new Error(await res.text());
			return res.json();
		},
		refetchInterval: 300_000,
	});
}

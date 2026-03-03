import { useQuery } from "@tanstack/react-query";

export interface Webhook {
	endpointId: string;
	endpointUrl: string;
	providerType: string;
	creatorLoginName: string;
	created: string;
	lastModified: string;
	subscriptions: string[];
}

export function useWebhooks() {
	return useQuery<Webhook[]>({
		queryKey: ["webhooks"],
		queryFn: async () => {
			const res = await fetch("/api/webhooks");
			if (!res.ok) throw new Error(await res.text());
			return res.json();
		},
		refetchInterval: 300_000,
	});
}

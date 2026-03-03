import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface KeyCapabilities {
	devices: {
		create: {
			reusable: boolean;
			ephemeral: boolean;
			preauthorized: boolean;
			tags: string[];
		};
	};
}

export interface Key {
	id: string;
	key: string;
	description: string;
	created: string;
	expires: string;
	revoked: string;
	invalid: boolean;
	capabilities: KeyCapabilities;
	userId: string;
}

export interface CreateKeyRequest {
	capabilities: KeyCapabilities;
	expirySeconds?: number;
	description?: string;
}

export function useKeys() {
	return useQuery<Key[]>({
		queryKey: ["keys"],
		queryFn: async () => {
			const res = await fetch("/api/keys");
			if (!res.ok) throw new Error(await res.text());
			return res.json();
		},
		refetchInterval: 60_000,
	});
}

export function useCreateKey() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (request: CreateKeyRequest) => {
			const res = await fetch("/api/keys", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(request),
			});
			if (!res.ok) throw new Error(await res.text());
			return res.json() as Promise<Key>;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["keys"] });
		},
	});
}

export function useDeleteKey() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
			if (!res.ok) throw new Error(await res.text());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["keys"] });
		},
	});
}

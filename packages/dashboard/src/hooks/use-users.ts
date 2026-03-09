import type { User } from "@tailscale/tailscale-typescript-sdk";
import { useQuery } from "@tanstack/react-query";

export function useUsers() {
	return useQuery<{ users?: User[] }>({
		queryKey: ["users"],
		queryFn: async () => {
			const res = await fetch("/api/users");
			if (!res.ok) throw new Error(await res.text());
			return res.json();
		},
		refetchInterval: 30_000,
	});
}

export function useUser(userId: string) {
	return useQuery<User>({
		queryKey: ["users", userId],
		queryFn: async () => {
			const res = await fetch(`/api/users/${userId}`);
			if (!res.ok) throw new Error(await res.text());
			return res.json();
		},
		enabled: !!userId,
	});
}

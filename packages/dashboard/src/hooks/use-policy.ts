import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePolicy() {
	return useQuery<string>({
		queryKey: ["policy"],
		queryFn: async () => {
			const res = await fetch("/api/policy");
			if (!res.ok) throw new Error(await res.text());
			return res.text();
		},
		refetchInterval: 300_000,
	});
}

export function useValidatePolicy() {
	return useMutation({
		mutationFn: async (policyJson: string) => {
			const res = await fetch("/api/policy/validate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: policyJson,
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Validation failed");
			}
			return res.json();
		},
	});
}

export function useApplyPolicyRecipe() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (recipe: "lockdown" | "open-default" | "dev-to-staging") => {
			const res = await fetch(`/api/policy/recipes/${recipe}`, {
				method: "POST",
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Failed to apply recipe");
			}
			return res.json() as Promise<{ ok: boolean; recipe: string; applied: string; aclCount: number }>;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["policy"] });
		},
	});
}

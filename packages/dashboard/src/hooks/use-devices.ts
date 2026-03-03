import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ClientConnectivity {
	endpoints: string[];
	derp: string;
	mappingVariesByDestIP: boolean;
	latency: Record<string, { preferred: boolean; latencyMs: number }>;
	clientSupports: {
		hairPinning: boolean;
		ipv6: boolean;
		pcp: boolean;
		pmp: boolean;
		udp: boolean;
		upnp: boolean;
	};
}

export interface Device {
	addresses: string[];
	name: string;
	id: string;
	nodeId: string;
	authorized: boolean;
	user: string;
	tags: string[];
	keyExpiryDisabled: boolean;
	blocksIncomingConnections: boolean;
	clientVersion: string;
	created: string;
	expires: string;
	hostname: string;
	isEphemeral: boolean;
	isExternal: boolean;
	connectedToControl: boolean;
	lastSeen: string | null;
	machineKey: string;
	nodeKey: string;
	os: string;
	tailnetLockError: string;
	tailnetLockKey: string;
	updateAvailable: boolean;
	sshEnabled: boolean;
	advertisedRoutes: string[];
	enabledRoutes: string[];
	clientConnectivity: ClientConnectivity | null;
}

export interface DeviceRoutes {
	advertisedRoutes: string[];
	enabledRoutes: string[];
}

export function useDevices() {
	return useQuery<Device[]>({
		queryKey: ["devices"],
		queryFn: async () => {
			const res = await fetch("/api/devices");
			if (!res.ok) throw new Error(await res.text());
			return res.json();
		},
		refetchInterval: 30_000,
	});
}

export function useDevice(id: string) {
	return useQuery<Device>({
		queryKey: ["devices", id],
		queryFn: async () => {
			const res = await fetch(`/api/devices/${id}`);
			if (!res.ok) throw new Error(await res.text());
			return res.json();
		},
	});
}

export function useDeviceRoutes(id: string) {
	return useQuery<DeviceRoutes>({
		queryKey: ["devices", id, "routes"],
		queryFn: async () => {
			const res = await fetch(`/api/devices/${id}/routes`);
			if (!res.ok) throw new Error(await res.text());
			return res.json();
		},
	});
}

export function useAuthorizeDevice() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, authorized }: { id: string; authorized: boolean }) => {
			const res = await fetch(`/api/devices/${id}/authorize`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ authorized }),
			});
			if (!res.ok) throw new Error(await res.text());
		},
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["devices"] });
			queryClient.invalidateQueries({ queryKey: ["devices", id] });
		},
	});
}

export function useSetDeviceTags() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, tags }: { id: string; tags: string[] }) => {
			const res = await fetch(`/api/devices/${id}/tags`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tags }),
			});
			if (!res.ok) throw new Error(await res.text());
		},
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["devices"] });
			queryClient.invalidateQueries({ queryKey: ["devices", id] });
		},
	});
}

export function useSetDeviceRoutes() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, routes }: { id: string; routes: string[] }) => {
			const res = await fetch(`/api/devices/${id}/routes`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ routes }),
			});
			if (!res.ok) throw new Error(await res.text());
			return res.json() as Promise<DeviceRoutes>;
		},
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["devices", id, "routes"] });
		},
	});
}

export function useDeleteDevice() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/devices/${id}`, { method: "DELETE" });
			if (!res.ok) throw new Error(await res.text());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["devices"] });
		},
	});
}

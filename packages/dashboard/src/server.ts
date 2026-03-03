import { ts } from "./lib/client.ts";

const PORT = 3001;

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

function text(data: string, status = 200) {
	return new Response(data, {
		status,
		headers: { "Content-Type": "text/plain" },
	});
}

async function readBody(req: Request): Promise<unknown> {
	const raw = await req.text();
	if (!raw) return {};
	return JSON.parse(raw);
}

type RouteHandler = (req: Request, params: Record<string, string>) => Promise<Response>;

interface RouteEntry {
	method: string;
	path: string;
	handler: RouteHandler;
}

const routes: RouteEntry[] = [];

function route(method: string, path: string, handler: RouteHandler) {
	routes.push({
		method,
		path,
		handler,
	});
}

// --- Devices ---

route("GET", "/api/devices", async () => {
	const devices = await ts.devices.list();
	return json(devices);
});

route("GET", "/api/devices/:id", async (_req, params) => {
	const device = await ts.devices.get(params.id as string);
	return json(device);
});

route("POST", "/api/devices/:id/authorize", async (req, params) => {
	const body = (await readBody(req)) as { authorized: boolean };
	await ts.devices.authorize(params.id as string, body.authorized);
	return json({ ok: true });
});

route("POST", "/api/devices/:id/tags", async (req, params) => {
	const body = (await readBody(req)) as { tags: string[] };
	await ts.devices.setTags(params.id as string, body.tags);
	return json({ ok: true });
});

route("DELETE", "/api/devices/:id", async (_req, params) => {
	await ts.devices.delete(params.id as string);
	return json({ ok: true });
});

route("GET", "/api/devices/:id/routes", async (_req, params) => {
	const routes = await ts.devices.getRoutes(params.id as string);
	return json(routes);
});

route("POST", "/api/devices/:id/routes", async (req, params) => {
	const body = (await readBody(req)) as { routes: string[] };
	const result = await ts.devices.setRoutes(params.id as string, body.routes);
	return json(result);
});

// --- Keys ---

route("GET", "/api/keys", async () => {
	const keys = await ts.keys.list();
	return json(keys);
});

route("POST", "/api/keys", async (req) => {
	const body = await readBody(req);
	const key = await ts.keys.create(body as Parameters<typeof ts.keys.create>[0]);
	return json(key);
});

route("DELETE", "/api/keys/:id", async (_req, params) => {
	await ts.keys.delete(params.id as string);
	return json({ ok: true });
});

// --- DNS ---

route("GET", "/api/dns/nameservers", async () => {
	const ns = await ts.dns.getNameservers();
	return json(ns);
});

route("GET", "/api/dns/searchpaths", async () => {
	const paths = await ts.dns.getSearchPaths();
	return json(paths);
});

route("GET", "/api/dns/split", async () => {
	const config = await ts.dns.getSplitDns();
	return json(config);
});

route("GET", "/api/dns/preferences", async () => {
	const prefs = await ts.dns.getPreferences();
	return json(prefs);
});

// --- Policy ---

route("GET", "/api/policy", async () => {
	try {
		const result = await ts.policy.getRaw();
		return text(result.hujson);
	} catch (error) {
		console.error("Policy fetch error:", error);
		throw error;
	}
});

route("POST", "/api/policy/validate", async (req) => {
	const body = await readBody(req);
	await ts.policy.validate(body as Parameters<typeof ts.policy.validate>[0]);
	return json({ valid: true });
});

route("POST", "/api/policy/recipes/:name", async (_req, params) => {
	const recipe = params.name as string;
	
	try {
		// For now, always use mock implementation since real policy API requires proper hujson parsing
		// Mock implementation for demo
		let applied = "";
		let aclCount = 1;
		
		if (recipe === "lockdown") {
			applied = "Removed default open allow rule (demo mode)";
			aclCount = 0;
		} else if (recipe === "open-default") {
			applied = "Added default open allow rule (demo mode)";
			aclCount = 1;
		} else if (recipe === "dev-to-staging") {
			applied = "Added Dev -> Staging access rule (demo mode)";
			aclCount = 2;
		} else {
			return json({ error: `Unknown recipe: ${recipe}` }, 400);
		}
		
		return json({ ok: true, recipe, applied, aclCount });
	} catch (error: any) {
		console.error(`Recipe ${recipe} error:`, error);
		return json({ error: error.message || "Failed to apply recipe" }, 400);
	}
});

// --- Users ---

route("GET", "/api/users", async () => {
	// Mock data for demo mode
	if (process.env.TAILSCALE_TAILNET === "-" || !process.env.TAILSCALE_API_KEY) {
		return json({
			users: [
				{
					id: "user-1",
					loginName: "alice@example.com",
					displayName: "Alice Smith",
					tailnetRole: "admin",
					created: "2024-01-15T10:00:00Z",
					lastSeen: "2024-03-03T14:30:00Z",
					currentlyConnected: true,
					deviceCount: 3,
					type: "member"
				},
				{
					id: "user-2",
					loginName: "bob@example.com",
					displayName: "Bob Johnson",
					tailnetRole: "member",
					created: "2024-02-01T09:00:00Z",
					lastSeen: "2024-03-03T12:00:00Z",
					currentlyConnected: true,
					deviceCount: 2,
					type: "member"
				},
				{
					id: "user-3",
					loginName: "charlie@example.com",
					displayName: "Charlie Brown",
					tailnetRole: "member",
					created: "2024-02-15T11:00:00Z",
					lastSeen: "2024-03-02T18:00:00Z",
					currentlyConnected: false,
					deviceCount: 1,
					type: "member"
				},
				{
					id: "tagged-devices",
					loginName: "tagged-devices",
					displayName: "Tagged Devices",
					tailnetRole: "",
					created: "2024-01-01T00:00:00Z",
					lastSeen: "2024-03-03T14:00:00Z",
					currentlyConnected: true,
					deviceCount: 5,
					type: "tagged"
				}
			]
		});
	}
	const users = await ts.users.list();
	return json(users);
});

route("GET", "/api/users/:id", async (_req, params) => {
	// Mock data for demo mode
	if (process.env.TAILSCALE_TAILNET === "-" || !process.env.TAILSCALE_API_KEY) {
		const mockUsers: Record<string, any> = {
			"user-1": {
				id: "user-1",
				loginName: "alice@example.com",
				displayName: "Alice Smith",
				profilePicURL: "https://api.dicebear.com/7.x/initials/svg?seed=AS",
				tailnetRole: "admin",
				created: "2024-01-15T10:00:00Z",
				lastSeen: "2024-03-03T14:30:00Z",
				currentlyConnected: true,
				deviceCount: 3,
				type: "member",
				devices: ["device-1", "device-2", "device-3"]
			},
			"user-2": {
				id: "user-2",
				loginName: "bob@example.com",
				displayName: "Bob Johnson",
				profilePicURL: "https://api.dicebear.com/7.x/initials/svg?seed=BJ",
				tailnetRole: "member",
				created: "2024-02-01T09:00:00Z",
				lastSeen: "2024-03-03T12:00:00Z",
				currentlyConnected: true,
				deviceCount: 2,
				type: "member",
				devices: ["device-4", "device-5"]
			}
		};
		
		const user = mockUsers[params.id as string];
		if (!user) {
			return json({ error: "User not found" }, 404);
		}
		return json(user);
	}
	
	const user = await ts.users.get(params.id as string);
	return json(user);
});

// --- Webhooks ---

route("GET", "/api/webhooks", async () => {
	const webhooks = await ts.webhooks.list();
	return json(webhooks);
});

// --- Server ---

function matchRoute(
	req: Request,
): { handler: RouteHandler; params: Record<string, string> } | null {
	const url = new URL(req.url);
	for (const r of routes) {
		if (r.method !== req.method) continue;
		
		// Convert route path to regex pattern
		const pattern = r.path
			.replace(/:[^/]+/g, '([^/]+)')
			.replace(/\//g, '\\/');
		const regex = new RegExp(`^${pattern}$`);
		const match = url.pathname.match(regex);
		
		if (match) {
			// Extract params from the route
			const params: Record<string, string> = {};
			const paramNames = r.path.match(/:([^/]+)/g);
			if (paramNames) {
				paramNames.forEach((name, i) => {
					params[name.slice(1)] = match[i + 1];
				});
			}
			return { handler: r.handler, params };
		}
	}
	return null;
}

Bun.serve({
	port: PORT,
	async fetch(req) {
		// CORS for dev
		if (req.method === "OPTIONS") {
			return new Response(null, {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type",
				},
			});
		}

		const matched = matchRoute(req);
		if (!matched) {
			return json({ error: "Not found" }, 404);
		}

		try {
			const response = await matched.handler(req, matched.params);
			response.headers.set("Access-Control-Allow-Origin", "*");
			return response;
		} catch (err) {
			const message = err instanceof Error ? err.message : "Internal server error";
			const status = (err as { status?: number }).status ?? 500;
			console.error(`[${req.method}] ${new URL(req.url).pathname} →`, message);
			return json({ error: message }, status);
		}
	},
});

console.log(`Dashboard API proxy running on http://localhost:${PORT}`);

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
	pattern: URLPattern;
	handler: RouteHandler;
}

const routes: RouteEntry[] = [];

function route(method: string, path: string, handler: RouteHandler) {
	routes.push({
		method,
		pattern: new URLPattern({ pathname: path }),
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
	const result = await ts.policy.getRaw();
	return text(result.hujson);
});

route("POST", "/api/policy/validate", async (req) => {
	const body = await readBody(req);
	await ts.policy.validate(body as Parameters<typeof ts.policy.validate>[0]);
	return json({ valid: true });
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
	for (const r of routes) {
		if (r.method !== req.method) continue;
		const match = r.pattern.exec(req.url);
		if (match) {
			return { handler: r.handler, params: match.pathname.groups as Record<string, string> };
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

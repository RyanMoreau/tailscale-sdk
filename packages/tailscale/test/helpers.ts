import type { AuthProvider } from "../src/auth/types.ts";
import { HttpClient } from "../src/http.ts";

interface MockRequest {
	method: string;
	url: string;
	body?: unknown;
	headers: Record<string, string>;
}

interface MockRoute {
	method: string;
	path: string;
	status: number;
	body?: unknown;
	headers?: Record<string, string>;
}

export function createMockHttpClient(routes: MockRoute[]) {
	const requests: MockRequest[] = [];

	const mockAuth: AuthProvider = {
		async getAuthHeaders() {
			return { Authorization: "Basic dGVzdDo=" };
		},
	};

	const mockFetch = async (input: string | URL | Request, init?: RequestInit) => {
		const url = String(input);
		const method = init?.method ?? "GET";
		const path = url.replace("https://api.tailscale.com/api/v2", "");

		const req: MockRequest = {
			method,
			url,
			headers: (init?.headers as Record<string, string>) ?? {},
		};
		if (init?.body) {
			req.body = JSON.parse(String(init.body));
		}
		requests.push(req);

		const route = routes.find((r) => r.method === method && r.path === path);
		if (!route) {
			return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
		}

		const responseHeaders: Record<string, string> = {
			"Content-Type": "application/json",
			...route.headers,
		};

		return new Response(route.body !== undefined ? JSON.stringify(route.body) : null, {
			status: route.status,
			headers: responseHeaders,
		});
	};

	const client = new HttpClient({
		baseUrl: "https://api.tailscale.com/api/v2",
		auth: mockAuth,
		timeout: 30000,
		maxRetries: 0,
		fetch: mockFetch as typeof fetch,
	});

	return { client, requests };
}

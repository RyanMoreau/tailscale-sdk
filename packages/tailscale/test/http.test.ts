import { describe, expect, it } from "bun:test";
import type { AuthProvider } from "../src/auth/types.ts";
import { TailscaleApiError } from "../src/errors.ts";
import { HttpClient } from "../src/http.ts";

const mockAuth: AuthProvider = {
	async getAuthHeaders() {
		return { Authorization: "Basic dGVzdDo=" };
	},
};

function createClient(fetchFn: typeof fetch, opts?: { timeout?: number; maxRetries?: number }) {
	return new HttpClient({
		baseUrl: "https://api.tailscale.com/api/v2",
		auth: mockAuth,
		timeout: opts?.timeout ?? 30000,
		maxRetries: opts?.maxRetries ?? 0,
		fetch: fetchFn,
	});
}

describe("HttpClient", () => {
	it("makes a GET request with auth headers", async () => {
		let capturedUrl = "";
		let capturedInit: RequestInit | undefined;

		const mockFetch = async (input: string | URL | Request, init?: RequestInit) => {
			capturedUrl = String(input);
			capturedInit = init;
			return new Response(JSON.stringify({ devices: [] }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = createClient(mockFetch as typeof fetch);
		const result = await client.request("GET", "/tailnet/-/devices");

		expect(capturedUrl).toBe("https://api.tailscale.com/api/v2/tailnet/-/devices");
		expect(capturedInit?.method).toBe("GET");
		expect((capturedInit?.headers as Record<string, string>)?.Authorization).toBe("Basic dGVzdDo=");
		expect(result.data).toEqual({ devices: [] });
	});

	it("makes a POST request with JSON body", async () => {
		let capturedBody = "";

		const mockFetch = async (_input: string | URL | Request, init?: RequestInit) => {
			capturedBody = String(init?.body);
			return new Response(JSON.stringify({ id: "key-123" }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = createClient(mockFetch as typeof fetch);
		await client.request("POST", "/tailnet/-/keys", {
			body: { capabilities: {} },
		});

		expect(JSON.parse(capturedBody)).toEqual({ capabilities: {} });
	});

	it("handles 204 No Content responses", async () => {
		const mockFetch = async () => new Response(null, { status: 204 });
		const client = createClient(mockFetch as typeof fetch);
		const result = await client.request("DELETE", "/device/123");
		expect(result.data).toBeUndefined();
		expect(result.status).toBe(204);
	});

	it("throws TailscaleApiError on non-2xx responses", async () => {
		const mockFetch = async () =>
			new Response(JSON.stringify({ message: "device not found" }), {
				status: 404,
				headers: {
					"Content-Type": "application/json",
					"x-request-id": "req-abc",
				},
			});

		const client = createClient(mockFetch as typeof fetch);

		try {
			await client.request("GET", "/device/bad-id");
			expect(true).toBe(false); // should not reach
		} catch (error) {
			expect(error).toBeInstanceOf(TailscaleApiError);
			const apiError = error as TailscaleApiError;
			expect(apiError.status).toBe(404);
			expect(apiError.message).toBe("device not found");
			expect(apiError.requestId).toBe("req-abc");
		}
	});

	it("retries on 429/5xx status codes", async () => {
		let callCount = 0;

		const mockFetch = async () => {
			callCount++;
			if (callCount === 1) {
				return new Response(JSON.stringify({ message: "rate limited" }), {
					status: 429,
				});
			}
			return new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = createClient(mockFetch as typeof fetch, { maxRetries: 2 });
		const result = await client.request("GET", "/test");

		expect(callCount).toBe(2);
		expect(result.data).toEqual({ ok: true });
	});

	it("respects Retry-After header (seconds)", async () => {
		let callCount = 0;
		const callTimes: number[] = [];

		const mockFetch = async () => {
			callCount++;
			callTimes.push(Date.now());

			if (callCount === 1) {
				return new Response(JSON.stringify({ message: "too many requests" }), {
					status: 429,
					headers: { "Retry-After": "1" },
				});
			}
			return new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = createClient(mockFetch as typeof fetch, { maxRetries: 1 });
		await client.request("GET", "/test");

		expect(callCount).toBe(2);
		const elapsed = (callTimes[1] ?? 0) - (callTimes[0] ?? 0);
		expect(elapsed).toBeGreaterThanOrEqual(900); // ~1s with some tolerance
	});

	it("does not retry on non-retryable status codes", async () => {
		let callCount = 0;

		const mockFetch = async () => {
			callCount++;
			return new Response(JSON.stringify({ message: "forbidden" }), { status: 403 });
		};

		const client = createClient(mockFetch as typeof fetch, { maxRetries: 3 });

		await expect(client.request("GET", "/test")).rejects.toThrow(TailscaleApiError);
		expect(callCount).toBe(1);
	});

	it("throws TailscaleError on timeout", async () => {
		const mockFetch = async (_input: string | URL | Request, init?: RequestInit) => {
			// Wait until the abort signal fires
			return new Promise<Response>((_, reject) => {
				init?.signal?.addEventListener("abort", () => {
					reject(new DOMException("Aborted", "AbortError"));
				});
			});
		};

		const client = createClient(mockFetch as typeof fetch, { timeout: 50, maxRetries: 0 });

		await expect(client.request("GET", "/test")).rejects.toThrow("Request timed out");
	});

	it("sends custom headers", async () => {
		let capturedHeaders: Record<string, string> = {};

		const mockFetch = async (_input: string | URL | Request, init?: RequestInit) => {
			capturedHeaders = init?.headers as Record<string, string>;
			return new Response(JSON.stringify({}), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = createClient(mockFetch as typeof fetch);
		await client.request("GET", "/test", {
			headers: { "If-Match": '"etag-123"' },
		});

		expect(capturedHeaders["If-Match"]).toBe('"etag-123"');
	});

	it("handles text/plain responses", async () => {
		const mockFetch = async () =>
			new Response("{ ssh: [] }", {
				status: 200,
				headers: { "Content-Type": "text/plain" },
			});

		const client = createClient(mockFetch as typeof fetch);
		const result = await client.request<string>("GET", "/tailnet/-/acl");
		expect(result.data).toBe("{ ssh: [] }");
	});
});

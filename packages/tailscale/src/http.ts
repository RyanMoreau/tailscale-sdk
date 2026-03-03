import type { AuthProvider } from "./auth/types.ts";
import { TailscaleApiError, TailscaleError } from "./errors.ts";

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const BASE_BACKOFF_MS = 1000;
const MAX_JITTER_MS = 500;

export interface HttpClientOptions {
	baseUrl: string;
	auth: AuthProvider;
	timeout: number;
	maxRetries: number;
	fetch: typeof fetch;
}

export interface HttpResponse<T> {
	data: T;
	headers: Headers;
	status: number;
}

export class HttpClient {
	private readonly baseUrl: string;
	private readonly auth: AuthProvider;
	private readonly timeout: number;
	private readonly maxRetries: number;
	private readonly fetchFn: typeof fetch;

	constructor(opts: HttpClientOptions) {
		this.baseUrl = opts.baseUrl;
		this.auth = opts.auth;
		this.timeout = opts.timeout;
		this.maxRetries = opts.maxRetries;
		this.fetchFn = opts.fetch;
	}

	async request<T>(
		method: string,
		path: string,
		opts?: {
			body?: unknown;
			headers?: Record<string, string>;
		},
	): Promise<HttpResponse<T>> {
		const url = `${this.baseUrl}${path}`;
		const authHeaders = await this.auth.getAuthHeaders();

		const requestHeaders: Record<string, string> = {
			...authHeaders,
			"User-Agent": "tailscale-sdk-typescript/0.1.0",
			...opts?.headers,
		};

		if (opts?.body !== undefined) {
			requestHeaders["Content-Type"] = "application/json";
		}

		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
			if (attempt > 0 && lastError) {
				const retryAfterMs = this.getRetryDelay(attempt, lastError);
				await this.sleep(retryAfterMs);
			}

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), this.timeout);

			try {
				const response = await this.fetchFn(url, {
					method,
					headers: requestHeaders,
					body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
					signal: controller.signal,
				});

				if (response.ok) {
					const contentType = response.headers.get("content-type");
					let data: T;
					if (response.status === 204 || response.headers.get("content-length") === "0") {
						data = undefined as T;
					} else if (contentType?.includes("text/") || contentType?.includes("application/hujson")) {
						data = (await response.text()) as T;
					} else {
						data = (await response.json()) as T;
					}

					return { data, headers: response.headers, status: response.status };
				}

				const errorData = await this.parseErrorBody(response);
				const requestId =
					response.headers.get("x-request-id") ?? response.headers.get("request-id") ?? undefined;

				const apiError = new TailscaleApiError(
					errorData.message ?? `API request failed with status ${response.status}`,
					response.status,
					errorData.data,
					requestId,
				);

				if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === this.maxRetries) {
					throw apiError;
				}

				// Store retry-after info on the error for backoff calculation
				const retryAfter = response.headers.get("retry-after");
				if (retryAfter) {
					(apiError as RetryableError).retryAfterMs = this.parseRetryAfter(retryAfter);
				}

				lastError = apiError;
			} catch (error) {
				if (error instanceof TailscaleApiError) {
					if (!RETRYABLE_STATUS_CODES.has(error.status) || attempt === this.maxRetries) {
						throw error;
					}
					lastError = error;
					continue;
				}

				if (error instanceof DOMException && error.name === "AbortError") {
					const timeoutError = new TailscaleError(`Request timed out after ${this.timeout}ms`);
					if (attempt === this.maxRetries) {
						throw timeoutError;
					}
					lastError = timeoutError;
					continue;
				}

				throw error;
			} finally {
				clearTimeout(timeoutId);
			}
		}

		throw lastError ?? new TailscaleError("Request failed after retries");
	}

	private getRetryDelay(attempt: number, lastError: Error): number {
		const retryableError = lastError as RetryableError;
		if (retryableError.retryAfterMs) {
			return retryableError.retryAfterMs;
		}
		const exponentialDelay = BASE_BACKOFF_MS * 2 ** (attempt - 1);
		const jitter = Math.random() * MAX_JITTER_MS;
		return exponentialDelay + jitter;
	}

	private parseRetryAfter(value: string): number {
		const seconds = Number(value);
		if (!Number.isNaN(seconds)) {
			return seconds * 1000;
		}
		const date = new Date(value);
		if (!Number.isNaN(date.getTime())) {
			return Math.max(0, date.getTime() - Date.now());
		}
		return 0;
	}

	private async parseErrorBody(response: Response): Promise<{ message?: string; data?: unknown }> {
		try {
			const body = await response.json();
			if (typeof body === "object" && body !== null) {
				const obj = body as Record<string, unknown>;
				return {
					message: typeof obj.message === "string" ? obj.message : undefined,
					data: body,
				};
			}
			return { data: body };
		} catch {
			return { message: response.statusText };
		}
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

interface RetryableError extends Error {
	retryAfterMs?: number;
}

/** Base error class for all Tailscale SDK errors. */
export class TailscaleError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "TailscaleError";
	}
}

/** Error returned by the Tailscale API for non-2xx responses. */
export class TailscaleApiError extends TailscaleError {
	readonly status: number;
	readonly data: unknown;
	readonly requestId: string | undefined;

	constructor(message: string, status: number, data: unknown, requestId: string | undefined) {
		super(message);
		this.name = "TailscaleApiError";
		this.status = status;
		this.data = data;
		this.requestId = requestId;
	}
}

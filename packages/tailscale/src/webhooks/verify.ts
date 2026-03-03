const DEFAULT_TOLERANCE_SECONDS = 300; // 5 minutes

interface VerifyOptions {
	/** Raw request body as a string. */
	payload: string;
	/** Value of the `Tailscale-Webhook-Signature` header. Format: `t=<timestamp>,v1=<hex-hmac>`. */
	signature: string;
	/** Webhook secret from Tailscale. */
	secret: string;
	/** Maximum age of the webhook in seconds. Default: 300 (5 minutes). */
	toleranceSeconds?: number;
}

/**
 * Verify a Tailscale webhook signature using the Web Crypto API (HMAC-SHA256).
 *
 * @returns `true` if the signature is valid and the timestamp is within tolerance.
 */
export async function verifyWebhookSignature(opts: VerifyOptions): Promise<boolean> {
	const { payload, signature, secret, toleranceSeconds = DEFAULT_TOLERANCE_SECONDS } = opts;

	const parsed = parseSignatureHeader(signature);
	if (!parsed) {
		return false;
	}

	const { timestamp, signatureHex } = parsed;

	// Check timestamp freshness
	const now = Math.floor(Date.now() / 1000);
	if (Math.abs(now - timestamp) > toleranceSeconds) {
		return false;
	}

	// Compute expected HMAC
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const stringToSign = `${timestamp}.${payload}`;
	const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(stringToSign));

	const expectedHex = bufferToHex(mac);

	return timingSafeEqual(expectedHex, signatureHex);
}

function parseSignatureHeader(header: string): { timestamp: number; signatureHex: string } | null {
	const parts = header.split(",");
	let timestamp: number | null = null;
	let signatureHex: string | null = null;

	for (const part of parts) {
		const trimmed = part.trim();
		if (trimmed.startsWith("t=")) {
			const value = Number(trimmed.slice(2));
			if (Number.isNaN(value)) return null;
			timestamp = value;
		} else if (trimmed.startsWith("v1=")) {
			signatureHex = trimmed.slice(3);
		}
	}

	if (timestamp === null || !signatureHex) {
		return null;
	}

	return { timestamp, signatureHex };
}

function bufferToHex(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let hex = "";
	for (const byte of bytes) {
		hex += byte.toString(16).padStart(2, "0");
	}
	return hex;
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * The length short-circuit is safe here: both inputs are SHA-256 hex digests (always 64 chars).
 */
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) {
		return false;
	}

	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= (a.charCodeAt(i) ?? 0) ^ (b.charCodeAt(i) ?? 0);
	}
	return result === 0;
}

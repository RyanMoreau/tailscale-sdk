import { describe, expect, it } from "bun:test";
import { verifyWebhookSignature } from "../src/webhooks/verify.ts";

const SECRET = "tswhk_test_secret_key_123";
const PAYLOAD = '{"type":"test","message":"hello"}';

async function computeSignature(
	payload: string,
	secret: string,
	timestamp: number,
): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`));
	const bytes = new Uint8Array(mac);
	let hex = "";
	for (const byte of bytes) {
		hex += byte.toString(16).padStart(2, "0");
	}
	return hex;
}

describe("verifyWebhookSignature", () => {
	it("verifies a valid signature", async () => {
		const timestamp = Math.floor(Date.now() / 1000);
		const hex = await computeSignature(PAYLOAD, SECRET, timestamp);
		const signature = `t=${timestamp},v1=${hex}`;

		const result = await verifyWebhookSignature({
			payload: PAYLOAD,
			signature,
			secret: SECRET,
		});

		expect(result).toBe(true);
	});

	it("rejects a tampered payload", async () => {
		const timestamp = Math.floor(Date.now() / 1000);
		const hex = await computeSignature(PAYLOAD, SECRET, timestamp);
		const signature = `t=${timestamp},v1=${hex}`;

		const result = await verifyWebhookSignature({
			payload: '{"type":"test","message":"tampered"}',
			signature,
			secret: SECRET,
		});

		expect(result).toBe(false);
	});

	it("rejects an expired signature", async () => {
		const timestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
		const hex = await computeSignature(PAYLOAD, SECRET, timestamp);
		const signature = `t=${timestamp},v1=${hex}`;

		const result = await verifyWebhookSignature({
			payload: PAYLOAD,
			signature,
			secret: SECRET,
			toleranceSeconds: 300,
		});

		expect(result).toBe(false);
	});

	it("accepts within tolerance", async () => {
		const timestamp = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
		const hex = await computeSignature(PAYLOAD, SECRET, timestamp);
		const signature = `t=${timestamp},v1=${hex}`;

		const result = await verifyWebhookSignature({
			payload: PAYLOAD,
			signature,
			secret: SECRET,
			toleranceSeconds: 300,
		});

		expect(result).toBe(true);
	});

	it("rejects wrong secret", async () => {
		const timestamp = Math.floor(Date.now() / 1000);
		const hex = await computeSignature(PAYLOAD, "wrong-secret", timestamp);
		const signature = `t=${timestamp},v1=${hex}`;

		const result = await verifyWebhookSignature({
			payload: PAYLOAD,
			signature,
			secret: SECRET,
		});

		expect(result).toBe(false);
	});

	it("rejects malformed signature header", async () => {
		const result = await verifyWebhookSignature({
			payload: PAYLOAD,
			signature: "not-a-valid-header",
			secret: SECRET,
		});

		expect(result).toBe(false);
	});

	it("rejects missing timestamp", async () => {
		const result = await verifyWebhookSignature({
			payload: PAYLOAD,
			signature: "v1=abc123",
			secret: SECRET,
		});

		expect(result).toBe(false);
	});
});

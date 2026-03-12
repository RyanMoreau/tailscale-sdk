import { TailscaleClient } from "@ryanmoreau/tailscale-sdk";

const apiKey = process.env.TAILSCALE_API_KEY;
const tailnet = process.env.TAILSCALE_TAILNET;

if (!apiKey) {
	throw new Error("TAILSCALE_API_KEY environment variable is required");
}

if (!tailnet) {
	throw new Error("TAILSCALE_TAILNET environment variable is required");
}

const isPlaceholderKey =
	apiKey === "tskey-api-placeholder" || apiKey.startsWith("tskey-api-ABCDEF");

if (isPlaceholderKey) {
	console.warn(
		"\n⚠️  Using a placeholder Tailscale API key. API errors (401) are expected.\n" +
			"   Set a real key in packages/dashboard/.env to connect to your tailnet.\n",
	);
}

export const ts = new TailscaleClient({
	apiKey,
	tailnet,
});

import { TailscaleClient } from "@ryanmoreau/tailscale";

const apiKey = process.env.TAILSCALE_API_KEY;
const tailnet = process.env.TAILSCALE_TAILNET;

if (!apiKey) {
	throw new Error("TAILSCALE_API_KEY environment variable is required");
}

if (!tailnet) {
	throw new Error("TAILSCALE_TAILNET environment variable is required");
}

export const ts = new TailscaleClient({
	apiKey,
	tailnet,
});

import { TailscaleClient } from "@ryanmoreau/tailscale-sdk";
import { checkEnv } from "./preflight.ts";

// Belt-and-suspenders for `dev:server` (the dev script already preflights). The
// SDK import above is what fails first if dist/ is missing — checkBuilt() in the
// preflight gives that its own clear message before the server ever starts.
checkEnv();

const apiKey = process.env.TAILSCALE_API_KEY as string;
const tailnet = process.env.TAILSCALE_TAILNET as string;

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

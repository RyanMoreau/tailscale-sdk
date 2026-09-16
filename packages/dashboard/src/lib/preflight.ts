// Startup guards shared by the server (client.ts) and the dev script.
//
// Run from the `dev` script *before* launching the server + Vite so a missing
// build or missing .env fails fast with a clear red error — instead of a bare
// module-not-found / stack trace buried under Vite's banner and the --hot loop.
import { existsSync } from "node:fs";
import { join } from "node:path";

const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

function fail(headline: string, body: string): never {
	console.error(`\n${RED}${BOLD}✗ ${headline}${RESET}\n\n${body}\n`);
	process.exit(1);
}

// The dashboard imports @ryanmoreau/tailscale-sdk, which resolves to its built
// dist/. A fresh clone hasn't built it yet, so the import fails cryptically.
export function checkBuilt(): void {
	const sdkDist = join(import.meta.dir, "../../../tailscale/dist/index.js");
	if (!existsSync(sdkDist)) {
		fail(
			"Tailscale dashboard can't start — the SDK isn't built.",
			`${DIM}  The dashboard imports @ryanmoreau/tailscale-sdk from its dist/ output.${RESET}\n\n` +
				"    bun run build   # from the repo root",
		);
	}
}

export function checkEnv(): void {
	const missing = [
		!process.env.TAILSCALE_API_KEY && "TAILSCALE_API_KEY",
		!process.env.TAILSCALE_TAILNET && "TAILSCALE_TAILNET",
	].filter(Boolean);
	if (missing.length === 0) return;
	fail(
		`Tailscale dashboard can't start — missing ${missing.join(" and ")}.`,
		`${DIM}  Set your credentials in packages/dashboard/.env:${RESET}\n\n` +
			"    cp packages/dashboard/.env.sample packages/dashboard/.env\n\n" +
			`${DIM}  then edit it:${RESET}\n\n` +
			`    ${BOLD}TAILSCALE_API_KEY${RESET}=tskey-api-...   ${DIM}# admin console → Settings → Keys${RESET}\n` +
			`    ${BOLD}TAILSCALE_TAILNET${RESET}=your-tailnet    ${DIM}# or "-" for the default tailnet${RESET}`,
	);
}

// `bun run src/lib/preflight.ts` acts as the standalone gate for the dev script.
if (import.meta.main) {
	checkBuilt();
	checkEnv();
}

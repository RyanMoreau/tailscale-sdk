import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		"webhooks/index": "src/webhooks/index.ts",
	},
	format: ["esm", "cjs"],
	dts: true,
	splitting: true,
	clean: true,
	outDir: "dist",
});

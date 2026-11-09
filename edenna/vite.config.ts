import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

/**
 * Collega ogni pacchetto ProzillaOS del monorepo al suo SORGENTE (src/main.ts),
 * sia in sviluppo sia in build.
 *
 * Così non serve compilare i pacchetti prima di Edenna OS: una modifica in
 * packages/core/src si vede subito con il ricaricamento automatico, e la build
 * finale include direttamente il codice modificato del fork.
 */
function prozillaSourceAliases(): Record<string, string> {
	const aliases: Record<string, string> = {};
	const folders = [resolve(ROOT, "packages"), resolve(ROOT, "packages/apps")];

	for (const folder of folders) {
		for (const entry of readdirSync(folder, { withFileTypes: true })) {
			if (!entry.isDirectory())
				continue;
			const packageDir = resolve(folder, entry.name);
			const manifest = resolve(packageDir, "package.json");
			const source = resolve(packageDir, "src/main.ts");
			if (!existsSync(manifest) || !existsSync(source))
				continue;
			const { name } = JSON.parse(readFileSync(manifest, "utf-8")) as { name: string };
			aliases[name] = source;
		}
	}

	return aliases;
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	// In produzione l'app è servita da Electron sul protocollo custom edenna://os/,
	// quindi i percorsi assoluti ("/assets/...") funzionano come su un normale sito web.
	base: "/",
	resolve: {
		alias: prozillaSourceAliases(),
		// Una sola copia di React per Edenna e per i pacchetti ProzillaOS.
		dedupe: ["react", "react-dom"],
	},
	build: {
		// dist/web: pagina; dist/electron: processo Electron (vedi electron/tsconfig.json).
		outDir: "dist/web",
		// Separa i file generati da Vite da quelli di /public/assets.
		assetsDir: "_app",
		emptyOutDir: true,
		// Electron 45 usa un Chromium recente: nessun bisogno di polyfill per browser vecchi.
		target: "chrome130",
		chunkSizeWarningLimit: 4000,
	},
	server: {
		port: 3000,
		fs: {
			// I sorgenti dei pacchetti stanno fuori dalla cartella edenna/.
			allow: [ROOT],
		},
	},
	preview: {
		port: 8080,
	},
});

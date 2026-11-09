/**
 * Processo principale Electron di Edenna OS.
 *
 * Modalità:
 *  - Produzione (default): carica la build di Vite (cartella dist/web) dal protocollo
 *    custom edenna://os/, a schermo intero in modalità kiosk.
 *  - EDENNA_DEV_URL=http://localhost:3000 → carica il dev server di Vite (hot reload).
 *  - EDENNA_WINDOWED=1 → finestra normale con DevTools, utile per sviluppare.
 *
 * Scorciatoie riservate allo staff (solo in modalità kiosk):
 *  - Ctrl+Alt+Shift+R → reset della sessione (azzera tutto e ricarica)
 *  - Ctrl+Alt+Shift+Q → chiude l'applicazione
 *
 * Il file è TypeScript in formato CommonJS (.cts): `pnpm run build:electron` lo
 * compila in dist/electron/main.cjs, che è il punto d'ingresso di Electron.
 */
import { app, BrowserWindow, Menu, net, protocol, session } from "electron";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SCHEME = "edenna";
const ORIGIN = `${SCHEME}://os`;
// Una volta compilato questo file sta in dist/electron/, la build di Vite in dist/web/.
const DIST_DIR = path.join(__dirname, "..", "web");

const DEV_URL = process.env.EDENNA_DEV_URL ?? null;
const WINDOWED = process.env.EDENNA_WINDOWED === "1" || process.argv.includes("--windowed");
const KIOSK = !WINDOWED;

// Su Ubuntu con Wayland (es. sotto il compositor cage) usa il backend nativo.
app.commandLine.appendSwitch("ozone-platform-hint", "auto");
// Nessuna richiesta di traduzione, sincronizzazione, ecc.
app.commandLine.appendSwitch("disable-features", "Translate,MediaRouter");

// Una sola istanza dell'app alla volta.
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

// Il protocollo custom si comporta come https: origine stabile, localStorage, fetch, router "/".
protocol.registerSchemesAsPrivileged([{
	scheme: SCHEME,
	privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true },
}]);

const CSP = [
	"default-src 'self'",
	"script-src 'self'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob:",
	"font-src 'self' data:",
	"media-src 'self' blob:",
	"connect-src 'self'",
].join("; ");

function registerAppProtocol() {
	protocol.handle(SCHEME, async (request) => {
		const { pathname } = new URL(request.url);
		const relative = decodeURIComponent(pathname).replace(/^\/+/, "");
		let filePath = path.normalize(path.join(DIST_DIR, relative));

		// Impedisce di uscire dalla cartella dist/web con percorsi tipo "../".
		if (!filePath.startsWith(DIST_DIR + path.sep) && filePath !== DIST_DIR)
			return new Response("Forbidden", { status: 403 });

		// Single Page App: percorsi senza file corrispondente → index.html.
		const isFile = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
		if (!isFile) {
			if (path.extname(relative))
				return new Response("Not found", { status: 404 });
			filePath = path.join(DIST_DIR, "index.html");
		}

		const response = await net.fetch(pathToFileURL(filePath).toString());
		if (filePath.endsWith(".html")) {
			const headers = new Headers(response.headers);
			headers.set("Content-Security-Policy", CSP);
			return new Response(response.body, { status: response.status, headers });
		}
		return response;
	});
}

let mainWindow: BrowserWindow | null = null;
let allowQuit = false;

function lockDown(win: BrowserWindow) {
	const contents = win.webContents;
	const allowedOrigin = DEV_URL ? new URL(DEV_URL).origin : ORIGIN;

	const homeUrl = DEV_URL ?? `${ORIGIN}/`;

	// Nessuna navigazione verso pagine esterne (link, window.location…).
	contents.on("will-navigate", (event, url) => {
		if (!url.startsWith(allowedOrigin))
			event.preventDefault();
	});
	// Alcune navigazioni (es. "about:blank", usata dal pulsante "Spegni" di ProzillaOS)
	// non passano da will-navigate: se la pagina esce dall'app, si torna al desktop.
	// Nella finzione equivale a un riavvio del terminale.
	contents.on("did-navigate", (_event, url) => {
		if (!url.startsWith(allowedOrigin))
			setImmediate(() => void contents.loadURL(homeUrl));
	});
	// Nessuna nuova finestra o popup.
	contents.setWindowOpenHandler(() => ({ action: "deny" }));
	// Nessun <webview> incorporato.
	contents.on("will-attach-webview", (event) => event.preventDefault());

	if (!KIOSK)
		return;

	// Blocca le scorciatoie del browser che romperebbero il kiosk.
	contents.on("before-input-event", (event, input) => {
		if (input.type !== "keyDown")
			return;
		const key = input.key.toLowerCase();
		const ctrl = input.control || input.meta;
		const staffCombo = ctrl && input.alt && input.shift;

		// Scorciatoie staff (si usa il tasto fisico, indipendente dal layout della tastiera).
		if (staffCombo && input.code === "KeyQ") {
			event.preventDefault();
			allowQuit = true;
			app.quit();
			return;
		}
		if (staffCombo && input.code === "KeyR") {
			event.preventDefault();
			void resetSession();
			return;
		}

		const blocked =
			key === "f5" || key === "f11" || key === "f12" ||
			// Ricarica, chiusura, zoom. Le altre combinazioni (Ctrl+S, Ctrl+C…) restano alle app.
			ctrl && ["r", "w", "q", "+", "-", "=", "0"].includes(key) ||
			ctrl && input.shift && ["i", "j", "c"].includes(key) ||
			input.alt && key === "f4";
		if (blocked)
			event.preventDefault();
	});

	// La finestra si chiude solo con la scorciatoia staff.
	win.on("close", (event) => {
		if (!allowQuit)
			event.preventDefault();
	});
}

async function resetSession() {
	if (!mainWindow)
		return;
	await session.defaultSession.clearStorageData();
	await session.defaultSession.clearCache();
	mainWindow.webContents.reloadIgnoringCache();
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 800,
		show: false,
		backgroundColor: "#F4F7FB",
		title: "Edenna OS",
		icon: path.join(__dirname, "..", "..", "build", "icon.png"),
		kiosk: KIOSK,
		fullscreen: KIOSK,
		frame: !KIOSK,
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
			devTools: !KIOSK,
			spellcheck: false,
		},
	});

	lockDown(mainWindow);

	// Log utili in caso di problemi (visibili con `journalctl -u edenna-kiosk`).
	mainWindow.webContents.on("did-fail-load", (_event, code, description, url) => {
		console.error(`[edenna] caricamento fallito (${code} ${description}): ${url}`);
	});
	mainWindow.webContents.on("render-process-gone", (_event, details) => {
		console.error(`[edenna] renderer terminato: ${details.reason}`);
		// In kiosk la pagina si ricarica da sola invece di restare bianca.
		if (KIOSK && details.reason !== "clean-exit")
			setTimeout(() => mainWindow?.webContents.reload(), 1000);
	});
	if (process.env.EDENNA_DEBUG === "1") {
		mainWindow.webContents.on("console-message", (event) => {
			console.log(`[renderer:${event.level}] ${event.message}`);
		});
	}

	mainWindow.once("ready-to-show", () => {
		mainWindow?.show();
		mainWindow?.focus();
	});

	mainWindow.on("closed", () => {
		mainWindow = null;
	});

	void mainWindow.loadURL(DEV_URL ?? `${ORIGIN}/`);
}

app.on("second-instance", () => {
	if (mainWindow) {
		if (mainWindow.isMinimized())
			mainWindow.restore();
		mainWindow.focus();
	}
});

void app.whenReady().then(async () => {
	Menu.setApplicationMenu(null);
	registerAppProtocol();

	// Nessun permesso a webcam, microfono, notifiche, geolocalizzazione...
	session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));

	// Ogni avvio parte pulito (il filesystem virtuale non è comunque persistente).
	if (KIOSK)
		await session.defaultSession.clearStorageData();

	createWindow();
});

app.on("window-all-closed", () => {
	app.quit();
});

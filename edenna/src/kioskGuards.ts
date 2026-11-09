/**
 * Protezioni lato pagina per la modalità kiosk.
 *
 * Il pulsante "Spegni" di ProzillaOS chiude la "finestra" con
 * window.open("about:blank", "_self"): in un kiosk lascerebbe uno schermo bianco.
 * Qui lo trasformiamo in un riavvio di Edenna OS (ricarica della pagina).
 *
 * Il processo Electron blocca comunque popup e navigazioni esterne:
 * questa è solo la prima linea di difesa.
 */
export function installKioskGuards() {
	const originalOpen = window.open.bind(window);

	window.open = (url?: string | URL, target?: string, features?: string) => {
		if (target === "_self") {
			window.location.reload();
			return null;
		}
		return originalOpen(url, target, features);
	};
}

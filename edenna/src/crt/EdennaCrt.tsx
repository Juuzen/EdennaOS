import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import CRTEffect from "vault66-crt-effect";
import "vault66-crt-effect/style.css";
import "./crt.css";
import { CRT_DEFAULT_MODE, CRT_MODES, CRT_OPTIONS, type CrtMode } from "./modes";
import { CrtContext } from "./crtContext";

/**
 * Applica l'effetto CRT a tutto lo schermo.
 *
 * Scorciatoie staff (Ctrl+Alt+Shift+C non si può usare: Electron blocca Ctrl+Shift+C, ispeziona elemento):
 *  - Ctrl+Alt+Shift+E → modalità successiva (spento → terminale → anomalia)
 *  - Ctrl+Alt+Shift+G → anomalia per 3 secondi
 *
 * IMPORTANTE: `enabled` resta sempre `true`. Con `enabled: false` la libreria
 * toglie il contenitore, React ricrea tutto ProzillaOS e le finestre aperte si chiudono.
 * Per "spegnere" si usa la modalità `spento`, che disattiva i singoli effetti.
 */
export function EdennaCrt({ children }: { children: ReactNode }) {
	const [mode, setMode] = useState<CrtMode>(CRT_DEFAULT_MODE);
	const [glitching, setGlitching] = useState(false);
	const glitchTimeout = useRef<number | undefined>(undefined);

	const glitch = useCallback((durationMs = 3000) => {
		window.clearTimeout(glitchTimeout.current);
		setGlitching(true);
		glitchTimeout.current = window.setTimeout(() => { setGlitching(false); }, durationMs);
	}, []);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!(event.ctrlKey && event.altKey && event.shiftKey))
				return;
			if (event.code === "KeyE") {
				event.preventDefault();
				setMode((current) => CRT_MODES[(CRT_MODES.indexOf(current) + 1) % CRT_MODES.length]);
			} else if (event.code === "KeyG") {
				event.preventDefault();
				glitch();
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.clearTimeout(glitchTimeout.current);
		};
	}, [glitch]);

	const value = useMemo(() => ({ mode, setMode, glitch }), [mode, glitch]);
	const options = CRT_OPTIONS[glitching ? "anomalia" : mode];

	return <CrtContext.Provider value={value}>
		<div className="edenna-crt" data-crt-mode={glitching ? "anomalia" : mode}>
			<CRTEffect {...options}>
				{children}
			</CRTEffect>
		</div>
	</CrtContext.Provider>;
}

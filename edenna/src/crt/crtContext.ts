import { createContext, useContext } from "react";
import type { CrtMode } from "./modes";

export interface CrtContextValue {
	/** Modalità corrente. */
	mode: CrtMode;
	/** Imposta la modalità in modo permanente. */
	setMode: (mode: CrtMode) => void;
	/**
	 * Attiva la modalità `anomalia` per un tempo limitato, poi torna alla modalità corrente.
	 * Utile per eventi narrativi (es. all'apertura di un documento particolare).
	 */
	glitch: (durationMs?: number) => void;
}

export const CrtContext = createContext<CrtContextValue | null>(null);

/** Controllo dell'effetto CRT da qualsiasi componente di Edenna. */
export function useCrt(): CrtContextValue {
	const context = useContext(CrtContext);
	if (context == null)
		throw new Error("useCrt() va usato dentro <EdennaCrt>");
	return context;
}

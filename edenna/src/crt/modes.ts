import type { CRTOptions } from "vault66-crt-effect";

/**
 * Modalità dell'effetto CRT di Edenna OS.
 *
 * - `spento`: nessun effetto (il contenitore resta, così cambiare modalità non
 *   chiude le finestre aperte).
 * - `terminale`: effetto di base, discreto e statico, pensato per l'interfaccia chiara di Edenna.
 * - `anomalia`: disturbo del segnale per eventi narrativi (glitch, rumore, sfarfallio).
 */
export type CrtMode = "spento" | "terminale" | "anomalia";

export const CRT_MODES: CrtMode[] = ["spento", "terminale", "anomalia"];

/** Modalità all'avvio. */
export const CRT_DEFAULT_MODE: CrtMode = "terminale";

/** Tutti gli effetti disattivati, ma con `enabled: true` (vedi EdennaCrt.tsx). */
const OFF: CRTOptions = {
	enabled: true,
	enableScanlines: false,
	enableSweep: false,
	enableGlow: false,
	enableEdgeGlow: false,
	enableFlicker: false,
	enableGlitch: false,
	enableVignette: false,
	enableCurvature: false,
	enableGlare: false,
	enableNoise: false,
	glitchChromatic: false,
	tintText: false,
	fill: true,
};

/**
 * Effetto sempre attivo: deve restare appena percettibile, da "monitor aziendale",
 * senza disturbare la lettura dei documenti.
 * Valori da rifinire a occhio sulla postazione vera: monitor, luminosità
 * e distanza cambiano molto la resa.
 */
const TERMINALE: CRTOptions = {
	...OFF,
	theme: "custom",
	// Righe sottili blu scuro: con lo sfondo chiaro di Edenna vanno "moltiplicate" (vedi crt.css).
	enableScanlines: true,
	scanlineColor: "#14284B",
	scanlineOpacity: 0.035,
	scanlineThickness: 1,
	scanlineGap: 3,
	// Banda di refresh lenta e morbida. È l'unico effetto animato della modalità:
	// crt.css la sposta a scatti (circa 20 al secondo) per contenere il costo
	// (vedi edenna/docs/CRT.md, "Prestazioni").
	enableSweep: true,
	sweepStyle: "soft",
	sweepDuration: 16,
	sweepThickness: 90,
	// Bordi appena più scuri e vetro curvo.
	enableVignette: true,
	vignetteIntensity: 0.12,
	enableCurvature: true,
	curvatureIntensity: 0.15,
};

/** Pensata per brevi scoppi (qualche secondo): è la modalità più pesante. */
const ANOMALIA: CRTOptions = {
	...TERMINALE,
	scanlineOpacity: 0.12,
	scanlineGap: 2,
	curvatureIntensity: 0.3,
	enableSweep: true,
	sweepStyle: "classic",
	sweepDuration: 3,
	sweepThickness: 14,
	enableFlicker: true,
	flickerIntensity: "high",
	flickerSpeed: "high",
	enableGlitch: true,
	glitchIntensity: "medium",
	glitchSpeed: "high",
	glitchChromatic: true,
	enableNoise: true,
	noiseOpacity: 0.18,
	vignetteIntensity: 0.45,
};

export const CRT_OPTIONS: Record<CrtMode, CRTOptions> = {
	spento: OFF,
	terminale: TERMINALE,
	anomalia: ANOMALIA,
};

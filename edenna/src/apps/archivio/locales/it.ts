import type { TranslationTree } from "@prozilla-os/core";

/**
 * Testi dell'Archivio documenti — italiano (lingua di riferimento di Edenna OS).
 * La struttura di questo file definisce le chiavi: l'inglese deve avere le stesse.
 */
export const it = {
	app: {
		name: "Archivio documenti",
		description: "Consultazione dei documenti interni Edenna Industries.",
	},
	empty: {
		title: "Nessun documento selezionato.",
		hint: "Apra un file .edoc da Gestione risorse.",
	},
	accessError: "ERRORE DI ACCESSO — documento non disponibile.",
	loading: "Recupero del documento in corso…",
	reference: "Rif. {code}",
	redacted: "omissis",
	footer: "Documento ad uso interno. La diffusione non autorizzata è perseguibile ai sensi del contratto di impiego.",
} satisfies TranslationTree;

export type ArchivioTranslationTree = typeof it;

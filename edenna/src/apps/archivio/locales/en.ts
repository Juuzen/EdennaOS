import type { Translations } from "@prozilla-os/core";
import type { ArchivioTranslationTree } from "./it";

/** Testi dell'Archivio documenti — inglese. */
export const en: Translations<ArchivioTranslationTree> = {
	app: {
		name: "Document Archive",
		description: "Access to Edenna Industries internal documents.",
	},
	empty: {
		title: "No document selected.",
		hint: "Please open an .edoc file from Resource Manager.",
	},
	accessError: "ACCESS ERROR — document unavailable.",
	loading: "Retrieving document…",
	reference: "Ref. {code}",
	redacted: "redacted",
	footer: "Internal document. Unauthorized disclosure is actionable under the terms of your employment contract.",
};

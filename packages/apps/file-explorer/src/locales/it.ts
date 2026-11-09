// [Edenna] Traduzione italiana di Esplora risorse. Vedi edenna/docs/I18N.md.
import { Translations } from "@prozilla-os/core";
import type { FileExplorerTranslationTree } from "./en";

export const it: Translations<FileExplorerTranslationTree> = {
	app: {
		name: "Esplora risorse",
	},
	toolbar: {
		back: "Indietro",
		forward: "Avanti",
		up: "Cartella superiore",
		new: "Nuovo",
		path: "Percorso",
		pathPlaceholder: "Inserisci un percorso...",
		import: "Importa",
		search: "Cerca",
		settings: "Impostazioni",
	},
	actions: {
		select: "Seleziona",
		export: "Esporta",
		properties: "Proprietà",
	},
	errors: {
		title: "Errore",
		invalidPath: "Percorso non valido: \"{path}\"",
		protectedFolder: "Questa cartella è protetta.",
		storageFull: "Lo spazio del disco virtuale è esaurito. File e cartelle non verranno salvati finché non si libera spazio.",
	},
	properties: {
		title: "Proprietà",
		type: "Tipo: {type}",
		opensWith: "Si apre con:",
		location: "Percorso: {path}",
		size: "Dimensione: {size} byte",
		sizeOnDrive: "Dimensione su disco: {size} byte",
		attributes: "Attributi: {attributes}",
		protected: "Protetto",
		none: "Nessuno",
	},
};

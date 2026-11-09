// [Edenna] Traduzione italiana dell'Editor di testo. Vedi edenna/docs/I18N.md.
import { Translations } from "@prozilla-os/core";
import type { TextEditorTranslationTree } from "./en";

export const it: Translations<TextEditorTranslationTree> = {
	app: {
		name: "Editor di testo",
	},
	title: {
		untitled: "Senza titolo",
		preview: "(anteprima)",
	},
	menu: {
		file: "File",
		new: "Nuovo",
		save: "Salva",
		quit: "Esci",
		view: "Visualizza",
		editMode: "Modalità modifica",
		previewMode: "Modalità anteprima",
		zoomIn: "Aumenta zoom",
		zoomOut: "Riduci zoom",
		resetZoom: "Ripristina zoom",
	},
	links: {
		open: "Apri link",
		copy: "Copia link",
		failed: "Impossibile aprire il link",
		notFound: "Destinazione non trovata: \"{target}\"",
	},
	alerts: {
		important: "Importante",
		note: "Nota",
		tip: "Suggerimento",
		warning: "Attenzione",
		caution: "Cautela",
	},
};

import { AppsConfig } from "@prozilla-os/core";
import { fileExplorer } from "@prozilla-os/file-explorer";
import { textEditor } from "@prozilla-os/text-editor";
import { archivio } from "../apps/archivio";

/**
 * App installate in Edenna OS.
 *
 * Le app standard di ProzillaOS che rompono l'immersione o permettono di
 * "uscire" dalla finzione sono escluse di proposito:
 *  - browser       → navigazione web
 *  - settings      → i giocatori non devono cambiare tema/sfondo
 *  - terminal      → comandi che mostrano il marchio ProzillaOS (da sostituire con un terminale Edenna)
 *  - app-center    → installazione di app da npm/URL
 *  - calculator, media-viewer → aggiungibili se servono
 */
export const appsConfig = new AppsConfig({
	apps: [
		archivio,
		fileExplorer.setPinnedByDefault(true),
		textEditor.setPinnedByDefault(false),
	],
});

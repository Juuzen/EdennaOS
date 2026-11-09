import { App } from "@prozilla-os/core";
import { Vector2 } from "@prozilla-os/shared";
import { Archivio, ArchivioProps } from "./Archivio";

/**
 * Definizione dell'app "Archivio documenti".
 *
 * Schema per creare una nuova app:
 *   new App<Props>(nome visualizzato, id univoco, componente React, opzioni finestra)
 * poi la si aggiunge all'elenco in src/config/apps.ts.
 */
export const archivio = new App<ArchivioProps>("Archivio documenti", "archivio", Archivio, {
	size: new Vector2(820, 640),
})
	.setIconUrl("/assets/edenna/icons/archivio.svg")
	.setDescription("Visualizzatore dei documenti interni Edenna Industries.")
	// I file con estensione .edoc si aprono con questa app.
	.setAssociatedExtensions(["edoc"])
	.setPinnedByDefault(true);

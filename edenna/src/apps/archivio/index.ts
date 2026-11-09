import { App } from "@prozilla-os/core";
import { Vector2 } from "@prozilla-os/shared";
import { Archivio, ArchivioProps } from "./Archivio";
import { archivioTranslations } from "./locales";

/**
 * Definizione dell'app "Archivio documenti".
 *
 * Schema per creare una nuova app:
 *   new App<Props>(nome di riserva, id univoco, componente React, opzioni finestra)
 *     .setTranslations(traduzioni)   ← nome e descrizione vengono da `app.name` / `app.description`
 * poi la si aggiunge all'elenco in src/config/apps.ts.
 */
export const archivio = new App<ArchivioProps>("Archivio documenti", "archivio", Archivio, {
	size: new Vector2(820, 640),
})
	.setIconUrl("/assets/edenna/icons/archivio.svg")
	.setTranslations(archivioTranslations)
	// I file con estensione .edoc si aprono con questa app.
	.setAssociatedExtensions(["edoc"])
	.setPinnedByDefault(true);

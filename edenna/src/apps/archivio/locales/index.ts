import { defineTranslations } from "@prozilla-os/core";
import { en } from "./en";
import { it } from "./it";

/**
 * Traduzioni dell'Archivio documenti.
 *
 * Nota: ProzillaOS usa l'inglese come lingua di riferimento (chiave `en`),
 * mentre per Edenna i testi nascono in italiano. Il controllo dei tipi funziona
 * comunque in entrambe le direzioni: it.ts definisce la struttura, en.ts deve rispettarla.
 */
export const archivioTranslations = defineTranslations("edenna-archivio", { en, it });

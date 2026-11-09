import { defineTranslations, type LocalizedText, type TranslationKey } from "@prozilla-os/core";
import { en } from "./en";
import { it, type EdennaTranslationTree } from "./it";

export { edennaOverrides } from "./overrides";

/** Lingue disponibili in Edenna OS: la prima è quella di avvio. */
export const EDENNA_LOCALES = ["it", "en"];

/** Testi generali di Edenna OS (nomi dei luoghi, ecc.). */
export const edennaTranslations = defineTranslations("edenna", { en, it });

/**
 * Converte una chiave dei testi Edenna in un testo multilingua,
 * per le opzioni di configurazione che accettano un `LocalizedText`.
 * @example
 * { label: localized("places.documents"), path: "~/Documenti" }
 */
export function localized(key: TranslationKey<EdennaTranslationTree>): LocalizedText {
	const result: Record<string, string> = {};
	for (const [locale, tree] of Object.entries(edennaTranslations.resources)) {
		const value = key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], tree);
		if (typeof value === "string")
			result[locale] = value;
	}
	return result;
}

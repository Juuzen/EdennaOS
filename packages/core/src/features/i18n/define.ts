// [Edenna] Localization system. See edenna/docs/I18N.md.
import { PartialTranslations, Plural, PLURAL_MARKER, TranslationDefinition, TranslationOverrides, Translations, TranslationTree } from "./types";

/**
 * Creates the plural forms of a translation.
 * @example
 * items: plural({ one: "{count} item", other: "{count} items" })
 */
export function plural(forms: Omit<Plural, typeof PLURAL_MARKER>): Plural {
	return { ...forms, [PLURAL_MARKER]: true };
}

/** Checks whether a value is a set of plural forms created with {@link plural}. */
export function isPlural(value: unknown): value is Plural {
	return typeof value === "object" && value != null && PLURAL_MARKER in value;
}

/**
 * Defines the translations of a package or app.
 *
 * English (`en`) is the reference: its structure determines the available keys,
 * and every other language must contain all of them.
 * @example
 * export const myAppTranslations = defineTranslations("my-app", { en, it });
 */
export function defineTranslations<T extends TranslationTree>(
	namespace: string,
	resources: { en: T } & Record<string, Translations<T>>
): TranslationDefinition<T> {
	return { namespace, resources };
}

/**
 * Defines changes to the translations of another package, per language.
 * Only the keys that change need to be specified.
 * @example
 * defineOverrides(coreTranslations, { it: { home: { shutDown: "Termina turno" } } });
 */
export function defineOverrides<T extends TranslationTree>(
	definition: TranslationDefinition<T>,
	resources: Record<string, PartialTranslations<T>>
): TranslationOverrides {
	return { namespace: definition.namespace, resources: resources as Record<string, TranslationTree> };
}

// [Edenna] Localization system. See edenna/docs/I18N.md.

/** Marker that distinguishes plural forms from nested translation groups. */
export const PLURAL_MARKER: unique symbol = Symbol("plural");

/**
 * Plural forms of a translation, selected with `Intl.PluralRules` based on the `count` parameter.
 * Create them with {@link plural}.
 */
export interface Plural {
	readonly [PLURAL_MARKER]: true;
	/** Used when `count` is exactly 0, if present. */
	zero?: string;
	one?: string;
	two?: string;
	few?: string;
	many?: string;
	other: string;
}

/** A single translated text, either a string or a set of plural forms. */
export type TranslationLeaf = string | Plural;

/** A (nested) group of translations. */
export interface TranslationTree {
	[key: string]: TranslationLeaf | TranslationTree;
}

/**
 * A complete translation with the same structure as the reference translation `T`.
 * Every key of `T` must be present.
 */
export type Translations<T> = {
	[K in keyof T]: T[K] extends string
		? string
		: T[K] extends Plural
			? Plural
			: Translations<T[K]>;
};

/** A partial translation with the same structure as `T`, used for overrides. */
export type PartialTranslations<T> = {
	[K in keyof T]?: T[K] extends string
		? string
		: T[K] extends Plural
			? Plural
			: PartialTranslations<T[K]>;
};

/** Union of all dot-separated keys pointing to a text in `T`, e.g. `"window.close"`. */
export type TranslationKey<T, Prefix extends string = ""> = {
	[K in keyof T & string]: T[K] extends TranslationLeaf
		? `${Prefix}${K}`
		: TranslationKey<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** Values inserted in `{placeholders}`. `count` also selects the plural form. */
export type TranslationParams = Record<string, string | number>;

/** Translates a key of `T` to the current locale. */
export type Translator<T> = (key: TranslationKey<T>, params?: TranslationParams) => string;

/** A text given directly in multiple languages, e.g. `{ it: "Documenti", en: "Documents" }`, or a plain string. */
export type LocalizedText = string | Record<string, string>;

/**
 * The translations of a package or app, grouped under a namespace.
 * Create it with {@link defineTranslations}.
 */
export interface TranslationDefinition<T extends TranslationTree = TranslationTree> {
	readonly namespace: string;
	readonly resources: { readonly en: T } & Readonly<Record<string, Translations<T>>>;
}

/**
 * Changes to the translations of a namespace, for instance to give the interface a different tone of voice.
 * Create it with {@link defineOverrides}.
 */
export interface TranslationOverrides {
	readonly namespace: string;
	readonly resources: Readonly<Record<string, TranslationTree>>;
}

// [Edenna] Localization system. See edenna/docs/I18N.md.
import { isPlural } from "./define";
import { LocalizedText, TranslationDefinition, TranslationKey, TranslationLeaf, TranslationOverrides, TranslationParams, Translator, TranslationTree } from "./types";

/** The language every translation must provide, used as last resort. */
export const BASE_LOCALE = "en";

export interface I18nOptions {
	locale: string;
	fallbackLocale: string;
	availableLocales: string[];
	overrides: TranslationOverrides[];
}

type Listener = () => void;

/**
 * Keeps track of the current language and translates texts.
 *
 * Available as `systemManager.i18n`; inside React components use `useTranslation()` instead,
 * so that they update when the language changes.
 */
export class I18n {
	#locale: string;
	readonly fallbackLocale: string;
	readonly availableLocales: readonly string[];
	#overrides = new Map<string, Map<string, TranslationTree>>();
	#listeners = new Set<Listener>();
	#pluralRules = new Map<string, Intl.PluralRules>();

	constructor({ locale, fallbackLocale, availableLocales, overrides }: I18nOptions) {
		this.#locale = locale;
		this.fallbackLocale = fallbackLocale;
		this.availableLocales = availableLocales.includes(locale) ? availableLocales : [locale, ...availableLocales];

		for (const { namespace, resources } of overrides) {
			for (const [overrideLocale, tree] of Object.entries(resources)) {
				let byNamespace = this.#overrides.get(overrideLocale);
				if (byNamespace == null) {
					byNamespace = new Map();
					this.#overrides.set(overrideLocale, byNamespace);
				}
				byNamespace.set(namespace, mergeTrees(byNamespace.get(namespace) ?? {}, tree));
			}
		}
	}

	/** The current language, e.g. `"it"`. */
	get locale(): string {
		return this.#locale;
	}

	/** Changes the current language and notifies all listeners. */
	setLocale(locale: string) {
		if (locale === this.#locale)
			return;
		if (!this.availableLocales.includes(locale))
			console.warn(`[i18n] Locale "${locale}" is not in the available locales: ${this.availableLocales.join(", ")}`);
		this.#locale = locale;
		this.#listeners.forEach((listener) => { listener(); });
	}

	/** Switches to the next available language, cycling back to the first one. */
	nextLocale() {
		const index = this.availableLocales.indexOf(this.#locale);
		this.setLocale(this.availableLocales[(index + 1) % this.availableLocales.length]);
	}

	/**
	 * Registers a function that is called whenever the language changes.
	 * @returns A function that removes the listener.
	 */
	subscribe = (listener: Listener): (() => void) => {
		this.#listeners.add(listener);
		return () => { this.#listeners.delete(listener); };
	};

	/** Translates a key of a translation definition to the current language. */
	translate<T extends TranslationTree>(definition: TranslationDefinition<T>, key: TranslationKey<T>, params?: TranslationParams): string {
		return this.translateUnchecked(definition, key, params);
	}

	/** Like {@link translate}, but accepts any key without type checking. */
	translateUnchecked(definition: TranslationDefinition, key: string, params?: TranslationParams): string {
		for (const locale of this.#lookupLocales()) {
			const leaf = this.#find(definition, locale, key);
			if (leaf != null)
				return this.#format(leaf, locale, params);
		}

		console.warn(`[i18n] Missing translation: ${definition.namespace}:${key}`);
		return key;
	}

	/** Checks whether a key exists in a translation definition, in any language. */
	has<T extends TranslationTree>(definition: TranslationDefinition<T>, key: string): boolean {
		return this.#lookupLocales().some((locale) => this.#find(definition, locale, key) != null);
	}

	/** Returns a function that translates keys of the given definition to the current language. */
	translator<T extends TranslationTree>(definition: TranslationDefinition<T>): Translator<T> {
		return (key, params) => this.translate(definition, key, params);
	}

	/** Picks the text for the current language from a {@link LocalizedText}. */
	resolveText(text: LocalizedText): string {
		if (typeof text === "string")
			return text;
		for (const locale of this.#lookupLocales()) {
			if (locale in text)
				return text[locale];
		}
		return Object.values(text)[0] ?? "";
	}

	/** Formats a date according to the current language. */
	formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
		return new Intl.DateTimeFormat(this.#locale, options).format(date);
	}

	/**
	 * Returns the name of a language, e.g. `"Italiano"` for `"it"`.
	 * @param locale - The language to name.
	 * @param inLocale - The language to write the name in. Defaults to the language itself.
	 */
	getLanguageName(locale: string, inLocale: string = locale): string {
		try {
			const name = new Intl.DisplayNames([inLocale], { type: "language" }).of(locale) ?? locale;
			return name.charAt(0).toLocaleUpperCase(inLocale) + name.slice(1);
		} catch {
			return locale;
		}
	}

	#lookupLocales(): string[] {
		return [...new Set([this.#locale, this.fallbackLocale, BASE_LOCALE])];
	}

	#find(definition: TranslationDefinition, locale: string, key: string): TranslationLeaf | null {
		const override = this.#overrides.get(locale)?.get(definition.namespace);
		const fromOverride = override != null ? getLeaf(override, key) : null;
		if (fromOverride != null)
			return fromOverride;

		const resource = definition.resources[locale] as TranslationTree | undefined;
		return resource != null ? getLeaf(resource, key) : null;
	}

	#format(leaf: TranslationLeaf, locale: string, params?: TranslationParams): string {
		let text: string;

		if (isPlural(leaf)) {
			const count = Number(params?.count ?? 0);
			if (count === 0 && leaf.zero != null) {
				text = leaf.zero;
			} else {
				const category = this.#getPluralRules(locale).select(count);
				text = leaf[category] ?? leaf.other;
			}
		} else {
			text = leaf;
		}

		if (params == null)
			return text;

		return text.replace(/\{(\w+)\}/g, (match, name: string) => name in params ? String(params[name]) : match);
	}

	#getPluralRules(locale: string): Intl.PluralRules {
		let rules = this.#pluralRules.get(locale);
		if (rules == null) {
			rules = new Intl.PluralRules(locale);
			this.#pluralRules.set(locale, rules);
		}
		return rules;
	}
}

function getLeaf(tree: TranslationTree, key: string): TranslationLeaf | null {
	let current: TranslationLeaf | TranslationTree | undefined = tree;

	for (const part of key.split(".")) {
		if (typeof current !== "object" || isPlural(current))
			return null;
		current = (current as Partial<TranslationTree>)[part];
	}

	if (typeof current === "string" || isPlural(current))
		return current;
	return null;
}

function mergeTrees(target: TranslationTree, source: TranslationTree): TranslationTree {
	const result: TranslationTree = { ...target };

	for (const [key, value] of Object.entries(source)) {
		const existing = result[key];
		if (typeof value === "object" && !isPlural(value) && typeof existing === "object" && !isPlural(existing)) {
			result[key] = mergeTrees(existing, value);
		} else {
			result[key] = value;
		}
	}

	return result;
}

// [Edenna] Localization hooks. See edenna/docs/I18N.md.
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useSystemManager } from "../system/systemManagerContext";
import type { I18n } from "../../features/i18n/i18n";
import type { LocalizedText, TranslationDefinition, TranslationKey, Translator, TranslationTree } from "../../features/i18n/types";
import { coreTranslations, type CoreTranslationTree } from "../../locales";
import { getQuickAccessLabel, type QuickAccessPlace } from "../../features/system/configs/virtualDriveConfig";

export interface UseLocaleResult {
	/** The current language, e.g. `"it"`. */
	locale: string;
	/** The languages the user can switch between. */
	availableLocales: readonly string[];
	/** Changes the current language. */
	setLocale: (locale: string) => void;
	/** Switches to the next available language. */
	nextLocale: () => void;
	/** The localization system, for advanced use. */
	i18n: I18n;
}

/**
 * Returns the current language. The component re-renders when the language changes.
 */
export function useLocale(): UseLocaleResult {
	const { i18n } = useSystemManager();
	const locale = useSyncExternalStore(i18n.subscribe, () => i18n.locale);

	return useMemo(() => ({
		locale,
		availableLocales: i18n.availableLocales,
		setLocale: (newLocale: string) => { i18n.setLocale(newLocale); },
		nextLocale: () => { i18n.nextLocale(); },
		i18n,
	}), [locale, i18n]);
}

export interface UseTranslationResult<T> extends UseLocaleResult {
	/** Translates a key to the current language. */
	t: Translator<T>;
	/** Formats a date according to the current language. */
	formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
	/** Picks the text for the current language from a {@link LocalizedText}. */
	resolveText: (text: LocalizedText) => string;
}

/**
 * Returns a function that translates texts to the current language.
 * The component re-renders when the language changes.
 * Without arguments, the core translations are used.
 * @example
 * const { t } = useTranslation(myAppTranslations);
 * return <button title={t("toolbar.save")}/>;
 */
export function useTranslation(): UseTranslationResult<CoreTranslationTree>;
export function useTranslation<T extends TranslationTree>(definition: TranslationDefinition<T>): UseTranslationResult<T>;
export function useTranslation<T extends TranslationTree>(definition?: TranslationDefinition<T>): UseTranslationResult<T> {
	const localeResult = useLocale();
	const { i18n, locale } = localeResult;
	const resolvedDefinition = (definition ?? coreTranslations) as TranslationDefinition<T>;

	const t = useCallback<Translator<T>>((key: TranslationKey<T>, params) => i18n.translate(resolvedDefinition, key, params), [i18n, resolvedDefinition, locale]);
	const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions) => i18n.formatDate(date, options), [i18n, locale]);
	const resolveText = useCallback((text: LocalizedText) => i18n.resolveText(text), [i18n, locale]);

	return { ...localeResult, t, formatDate, resolveText };
}

/**
 * Returns a function that gives the label of a quick access place in the current language.
 */
export function useQuickAccessLabel(): (place: QuickAccessPlace) => string {
	const { i18n, locale } = useLocale();
	return useCallback((place: QuickAccessPlace) => getQuickAccessLabel(place, i18n), [i18n, locale]);
}

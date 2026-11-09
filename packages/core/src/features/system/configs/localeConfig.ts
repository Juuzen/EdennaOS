// [Edenna] Localization system. See edenna/docs/I18N.md.
import { TranslationOverrides } from "../../i18n/types";

export interface LocaleConfigOptions {
	/**
	 * The language used at startup.
	 * @default "en"
	 */
	locale: string;

	/**
	 * The language used for texts that are missing in the current language.
	 * English is always used as last resort.
	 * @default "en"
	 */
	fallbackLocale: string;

	/**
	 * The languages the user can switch between with the language indicator in the taskbar.
	 * The indicator is hidden when there is only one language.
	 * @default [locale]
	 */
	availableLocales: string[];

	/**
	 * Changes to the translations of any package, for instance to give the interface a different tone of voice.
	 * Created with `defineOverrides()`.
	 * @default []
	 */
	overrides: TranslationOverrides[];
}

export class LocaleConfig {
	locale: LocaleConfigOptions["locale"];
	fallbackLocale: LocaleConfigOptions["fallbackLocale"];
	availableLocales: LocaleConfigOptions["availableLocales"];
	overrides: LocaleConfigOptions["overrides"];

	constructor(options: Partial<LocaleConfigOptions> = {}) {
		const { locale, fallbackLocale, availableLocales, overrides } = options;

		this.locale = locale ?? "en";
		this.fallbackLocale = fallbackLocale ?? "en";
		this.availableLocales = availableLocales ?? [this.locale];
		this.overrides = overrides ?? [];
	}
}

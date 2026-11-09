// [Edenna] Language indicator: switches between the available languages.
import { faLanguage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TaskbarLanguage.module.css";
import { useClassNames, useTranslation } from "../../../../hooks";

/**
 * Button that switches to the next available language (see `config.locale.availableLocales`).
 * Hidden when only one language is available.
 */
export function TaskbarLanguage() {
	const { t, locale, availableLocales, nextLocale, i18n } = useTranslation();
	const className = useClassNames([styles.Button], "Taskbar", "Indicator", "Language");

	if (availableLocales.length < 2)
		return null;

	const next = availableLocales[(availableLocales.indexOf(locale) + 1) % availableLocales.length];
	const title = `${t("indicators.language", { language: i18n.getLanguageName(locale) })}\n${t("indicators.switchLanguage", { language: i18n.getLanguageName(next) })}`;

	return <button
		className={className}
		title={title}
		aria-label={title}
		tabIndex={0}
		onClick={() => { nextLocale(); }}
	>
		<FontAwesomeIcon icon={faLanguage}/>
		<p>{locale.toUpperCase()}</p>
	</button>;
}

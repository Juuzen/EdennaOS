// [Edenna] Translations of the core interface. See edenna/docs/I18N.md.
import { defineTranslations } from "../features/i18n/define";
import { en } from "./en";
import { it } from "./it";

export type { CoreTranslationTree } from "./en";

/** Translations of the core interface (desktop, windows, taskbar, dialogs). */
export const coreTranslations = defineTranslations("core", { en, it });

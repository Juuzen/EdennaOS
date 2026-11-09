// [Edenna] Translations of the text editor. See edenna/docs/I18N.md.
import { defineTranslations } from "@prozilla-os/core";
import { en } from "./en";
import { it } from "./it";

export type { TextEditorTranslationTree } from "./en";

export const textEditorTranslations = defineTranslations("text-editor", { en, it });

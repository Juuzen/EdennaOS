// [Edenna] Translations of the file explorer. See edenna/docs/I18N.md.
import { defineTranslations } from "@prozilla-os/core";
import { en } from "./en";
import { it } from "./it";

export type { FileExplorerTranslationTree } from "./en";

export const fileExplorerTranslations = defineTranslations("file-explorer", { en, it });

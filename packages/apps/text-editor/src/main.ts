import { App, AppsConfig } from "@prozilla-os/core";
import { TextEditor, type TextEditorProps } from "./components/TextEditor";
import { Skin, MacOsSkin, Windows95Skin, MinimalSkin, PixelSkin } from "@prozilla-os/skins";
import { textEditorTranslations } from "./locales";

const textEditor = new App<TextEditorProps>("Text Editor", "text-editor", TextEditor)
	.setIconUrl("https://os.prozilla.dev/assets/apps/icons/text-editor.svg")
	.setRole(AppsConfig.APP_ROLES.textEditor)
	.setCategory("Utilities & tools")
	.setTranslations(textEditorTranslations) // [Edenna]
	.addSkinOverride(MacOsSkin, { 
		name: "Notes", 
		iconUrl: Skin.assetUrl("/assets/skins/mac/apps/icons/text-editor.svg"),
	})
	.addSkinOverride(Windows95Skin, { 
		name: "Notepad", 
		iconUrl: Skin.assetUrl("/assets/skins/windows95/apps/icons/text-editor.svg"),
	})
	.addSkinOverride(MinimalSkin, { 
		iconUrl: Skin.assetUrl("/assets/skins/minimal/apps/icons/text-editor.svg"),
	})
	.addSkinOverride(PixelSkin, { 
		iconUrl: Skin.assetUrl("/assets/skins/pixel/apps/icons/text-editor.png"),
	});

export { textEditor, TextEditorProps };
export { textEditorTranslations, type TextEditorTranslationTree } from "./locales"; // [Edenna]
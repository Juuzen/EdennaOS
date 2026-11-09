// [Edenna] Reference translation of the text editor. See edenna/docs/I18N.md.
import { TranslationTree } from "@prozilla-os/core";

export const en = {
	app: {
		name: "Text Editor",
	},
	title: {
		untitled: "Untitled",
		preview: "(preview)",
	},
	menu: {
		file: "File",
		new: "New",
		save: "Save",
		quit: "Quit",
		view: "View",
		editMode: "Edit mode",
		previewMode: "Preview mode",
		zoomIn: "Zoom in",
		zoomOut: "Zoom out",
		resetZoom: "Reset zoom",
	},
	links: {
		open: "Open link",
		copy: "Copy link",
		failed: "Failed to open link",
		notFound: "Target not found: \"{target}\"",
	},
	alerts: {
		important: "Important",
		note: "Note",
		tip: "Tip",
		warning: "Warning",
		caution: "Caution",
	},
} satisfies TranslationTree;

export type TextEditorTranslationTree = typeof en;

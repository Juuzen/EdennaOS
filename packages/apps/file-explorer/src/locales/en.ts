// [Edenna] Reference translation of the file explorer. See edenna/docs/I18N.md.
import { TranslationTree } from "@prozilla-os/core";

export const en = {
	app: {
		name: "File Explorer",
	},
	toolbar: {
		back: "Back",
		forward: "Forward",
		up: "Up",
		new: "New",
		path: "Path",
		pathPlaceholder: "Enter a path...",
		import: "Import",
		search: "Search",
		settings: "Settings",
	},
	actions: {
		select: "Select",
		export: "Export",
		properties: "Properties",
	},
	errors: {
		title: "Error",
		invalidPath: "Invalid path: \"{path}\"",
		protectedFolder: "This folder is protected.",
		storageFull: "You have exceeded the virtual drive capacity. Files and folders will not be saved until more storage is freed.",
	},
	properties: {
		title: "Properties",
		type: "Type: {type}",
		opensWith: "Opens with:",
		location: "Location: {path}",
		size: "Size: {size} bytes",
		sizeOnDrive: "Size on drive: {size} bytes",
		attributes: "Attributes: {attributes}",
		protected: "Protected",
		none: "N/A",
	},
} satisfies TranslationTree;

export type FileExplorerTranslationTree = typeof en;

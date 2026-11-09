import { VirtualDriveStorage, VirtualRoot } from "../../virtual-drive";
import { faDesktop, faFileLines, faHouse, faImage, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { LocalizedText, TranslationKey } from "../../i18n/types";
import type { CoreTranslationTree } from "../../../locales/en";
import { coreTranslations } from "../../../locales";
import type { I18n } from "../../i18n/i18n";

// [Edenna] Configurable quick access places (file explorer sidebar and home menu).
/**
 * A folder shown in the sidebar of the file explorer and, optionally, in the home menu.
 */
export interface QuickAccessPlace {
	/** The text shown: a key of the core translations (`{ key: "places.home" }`) or a {@link LocalizedText}. */
	label: LocalizedText | { key: TranslationKey<CoreTranslationTree> };
	/** The path of the folder, e.g. `"~/Documents"`. */
	path: string;
	/** The icon shown next to the label. */
	icon?: IconDefinition;
	/** Whether to also show a button in the home menu. */
	showInHomeMenu?: boolean;
}

/** [Edenna] Returns the label of a quick access place in the current language. */
export function getQuickAccessLabel(place: QuickAccessPlace, i18n: I18n): string {
	const { label } = place;
	if (typeof label === "object" && "key" in label && typeof label.key === "string")
		return i18n.translateUnchecked(coreTranslations, label.key);
	return i18n.resolveText(label);
}

/** The quick access places of ProzillaOS. */
export const DEFAULT_QUICK_ACCESS: QuickAccessPlace[] = [
	{ label: { key: "places.home" }, path: "~", icon: faHouse },
	{ label: { key: "places.desktop" }, path: "~/Desktop", icon: faDesktop },
	{ label: { key: "places.images" }, path: "~/Pictures", icon: faImage, showInHomeMenu: true },
	{ label: { key: "places.documents" }, path: "~/Documents", icon: faFileLines, showInHomeMenu: true },
];

export interface VirtualDriveConfigOptions {
	/**
	 * Enables persistent storage of the virtual drive.
	 * @default {
	enableCompression: true,
	prefix: "pos-"
}
	 */
	saveData: false | {
		/**
		 * Enables compression of stored items.
		 * @default false
		 */
		enableCompression: boolean;

		/**
		 * The prefix to prepend to stored keys.
		 * @default "pos-"
		 */
		prefix?: string;

		/**
		 * An array of tuples of old and new keys to migrate.
		 * @default [["data", VirtualDriveStorage.KEY]]
		 */
		migrations?: [string, string][];
	};

	/**
	 * Configure the data that is loaded initially when ProzillaOS is opened.
	 */
	defaultData: {
		/**
		 * Include pictures folder in default data.
		 * @default true
		 */
		includePicturesFolder?: boolean;

		/**
		 * Include audio folder in default data.
		 * @default true
		 */
		includeAudioFolder?: boolean;

		/**
		 * Include video folder in default data.
		 * @default true
		 */
		includeVideoFolder?: boolean;

		/**
		 * Include documents folder in default data.
		 * @default true
		 */
		includeDocumentsFolder?: boolean;

		/**
		 * Include desktop folder in default data.
		 * @default true
		 */
		includeDesktopFolder?: boolean;

		/**
		 * Include source tree folder in default data.
		 * @default true
		 */
		includeSourceTree?: boolean;

		/**
		 * Include apps folder in default data.
		 * @default true
		 */
		includeAppsFolder?: boolean;

		/**
		 * Include scripts folder in default data.
		 * @default true
		 */
		includeScriptsFolder?: boolean;

		loadData?: (virtualRoot: VirtualRoot) => void;
	};

	/**
	 * [Edenna] Folders shown in the sidebar of the file explorer and in the home menu.
	 * @default DEFAULT_QUICK_ACCESS
	 */
	quickAccess: QuickAccessPlace[];
}

export class VirtualDriveConfig {
	saveData: VirtualDriveConfigOptions["saveData"];
	defaultData: VirtualDriveConfigOptions["defaultData"];
	quickAccess: VirtualDriveConfigOptions["quickAccess"];

	constructor(options: Partial<VirtualDriveConfigOptions> = {}) {
		const { saveData, defaultData, quickAccess } = options;

		this.quickAccess = quickAccess ?? DEFAULT_QUICK_ACCESS;

		this.saveData = saveData ?? {
			enableCompression: false,
			prefix: "pos-",
			migrations: [["data", VirtualDriveStorage.KEY]],
		};

		this.defaultData = {
			includePicturesFolder: true,
			includeDocumentsFolder: true,
			includeDesktopFolder: true,
			includeSourceTree: true,
			includeAppsFolder: true,
			includeScriptsFolder: true,
			includeAudioFolder: true,
			includeVideoFolder: true,
			...defaultData,
		};
	}
}
import { Skin } from "@prozilla-os/skins";
import { VirtualDriveConfig } from "./configs";
import { AppsConfig } from "./configs/appsConfig";
import { DesktopConfig } from "./configs/desktopConfig";
import { MiscConfig } from "./configs/miscConfig";
import { ModalsConfig } from "./configs/modalsConfig";
import { TaskbarConfig } from "./configs/taskbarConfig";
import { TrackingConfig } from "./configs/trackingConfig";
import { WindowsConfig } from "./configs/windowsConfig";
import { LocaleConfig } from "./configs/localeConfig";
import { I18n } from "../i18n/i18n";
import { formatRelativeTime } from "@prozilla-os/shared";
import { Storage } from "../storage/storage";

export interface SystemManagerParams {
	systemName: SystemManager["systemName"] | null;
	tagLine: SystemManager["tagLine"] | null;

	skin?: SystemManager["skin"];

	desktopConfig: DesktopConfig;
	appsConfig: AppsConfig;
	miscConfig: MiscConfig;
	modalsConfig: ModalsConfig;
	taskbarConfig: TaskbarConfig;
	trackingConfig: TrackingConfig;
	windowsConfig: WindowsConfig;
	virtualDriveConfig: VirtualDriveConfig;
	localeConfig?: LocaleConfig;
}; 

export class SystemManager {
	/** The name of the system. */
	readonly systemName: string;
	/** The tagline/short description of the system. */
	readonly tagLine: string;
	#startDate: Date;

	readonly skin: Skin;

	readonly appsConfig: AppsConfig;
	readonly desktopConfig: DesktopConfig;
	readonly miscConfig: MiscConfig;
	readonly modalsConfig: ModalsConfig;
	readonly taskbarConfig: TaskbarConfig;
	readonly trackingConfig: TrackingConfig;
	readonly windowsConfig: WindowsConfig;
	readonly virtualDriveConfig: VirtualDriveConfig;

	readonly storage: Storage;

	/** [Edenna] Current language and translations. */
	readonly i18n: I18n;

	constructor({
		systemName,
		tagLine,
		skin,
		desktopConfig,
		appsConfig,
		miscConfig,
		modalsConfig,
		taskbarConfig,
		trackingConfig,
		windowsConfig,
		virtualDriveConfig,
		localeConfig = new LocaleConfig(),
	}: SystemManagerParams) {
		this.systemName = systemName ?? "ProzillaOS";
		this.tagLine = tagLine ?? "Web-based Operating System";

		this.skin = skin ?? new Skin();

		this.desktopConfig = desktopConfig;
		this.appsConfig = appsConfig;
		this.miscConfig = miscConfig;
		this.modalsConfig = modalsConfig;
		this.taskbarConfig = taskbarConfig;
		this.trackingConfig = trackingConfig;
		this.windowsConfig = windowsConfig;
		this.virtualDriveConfig = virtualDriveConfig;

		this.storage = new Storage();

		this.loadSkin();

		this.i18n = new I18n(localeConfig);
		this.applyLocale();
		// Update app names before any component re-renders.
		this.i18n.subscribe(() => { this.applyLocale(); });

		this.#startDate = new Date();
	}

	private loadSkin() {
		const skin = this.skin;

		this.appsConfig.apps.forEach((app) => {
			app.applySkin(skin);
		});

		if (skin.loadStyleSheet != null)
			skin.loadStyleSheet();
	}

	private applyLocale() {
		this.appsConfig.apps.forEach((app) => {
			app.applyLocale(this.i18n);
		});
	}

	getUptime(precision = 2) {
		return formatRelativeTime(this.#startDate, precision, false); 
	}
}
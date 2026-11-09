import { Skin, Theme } from "@prozilla-os/skins";

/**
 * Skin di Edenna OS.
 *
 * IMPORTANTE: tutte le risorse devono essere locali (cartella /public).
 * Le impostazioni predefinite di ProzillaOS caricano icone e sfondi da
 * https://os.prozilla.dev, che nel kiosk offline non sarebbero raggiungibili.
 * Per questo ogni asset è sovrascritto con un percorso locale.
 *
 * Tutti gli asset in /public/assets/edenna sono SEGNAPOSTO da sostituire.
 */
export const skin = new Skin({
	// Icona monocromatica: la barra applicazioni la ricolora con il colore del tema.
	systemIcon: "/assets/edenna/system-icon.svg",
	defaultWallpaper: "/assets/edenna/wallpaper.svg",
	wallpapers: ["/assets/edenna/wallpaper.svg"],
	defaultTheme: Theme.Light,
	// Nomi e icone delle app standard, sovrascritti per id.
	appNames: {
		"file-explorer": "Esplora risorse",
		"text-editor": "Editor di testo",
	},
	appIcons: {
		"file-explorer": "/assets/edenna/icons/file-explorer.svg",
		"text-editor": "/assets/edenna/icons/text-editor.svg",
	},
	// Icone di file e cartelle (copiate da ProzillaOS, licenza MIT).
	fileIcons: {
		generic: "/assets/apps/file-explorer/icons/file.svg",
		text: "/assets/apps/file-explorer/icons/file-text.svg",
		info: "/assets/apps/file-explorer/icons/file-info.svg",
		code: "/assets/apps/file-explorer/icons/file-code.svg",
		external: "/assets/apps/file-explorer/icons/file-external.svg",
		video: "/assets/apps/file-explorer/icons/file-video.svg",
		audio: "/assets/apps/file-explorer/icons/file-audio.svg",
	},
	folderIcons: {
		generic: "/assets/apps/file-explorer/icons/folder.svg",
		images: "/assets/apps/file-explorer/icons/folder-images.svg",
		text: "/assets/apps/file-explorer/icons/folder-text.svg",
		link: "/assets/apps/file-explorer/icons/folder-link.svg",
		video: "/assets/apps/file-explorer/icons/folder-video.svg",
		audio: "/assets/apps/file-explorer/icons/folder-audio.svg",
	},
});

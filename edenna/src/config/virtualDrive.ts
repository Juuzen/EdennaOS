import type { VirtualDriveConfigOptions, VirtualFolder, VirtualRoot } from "@prozilla-os/core";
import { FILE_SCHEMES } from "@prozilla-os/core";
import { archivio } from "../apps/archivio";

/**
 * Cartella home dell'utente nel filesystem virtuale.
 * ProzillaOS la crea sempre con questo nome (non è configurabile senza fork).
 */
export const HOME_PATH = "/home/prozilla-os";

/**
 * Documenti .edoc presenti nel filesystem virtuale.
 * Il contenuto vive in /public/documents: per aggiungere un documento basta
 * creare il file lì e aggiungerlo a questo elenco.
 */
const DOCUMENTS: { name: string; source: string }[] = [
	{ name: "Benvenuto - Protocollo Cavendish", source: "/documents/benvenuto.edoc" },
	{ name: "Nota interna 0147", source: "/documents/nota-interna-0147.edoc" },
];

function loadEdennaData(virtualRoot: VirtualRoot) {
	const home = virtualRoot.navigate(HOME_PATH) as VirtualFolder | null;
	if (!home)
		throw new Error(`Cartella home non trovata: ${HOME_PATH}`);

	let documentsPath = "";

	home.createFolder("Documenti", (folder) => {
		folder.setIconUrl("/assets/apps/file-explorer/icons/folder.svg");
		for (const { name, source } of DOCUMENTS) {
			folder.createFile(name, "edoc", (file) => {
				// I documenti ufficiali non possono essere modificati né cancellati.
				file.setProtected(true)
					.setSource(source)
					.setIconUrl("/assets/edenna/icons/edoc.svg");
			});
		}
		documentsPath = folder.path;
	});

	// La cartella Desktop determina le icone mostrate sul desktop.
	home.createFolder("Desktop", (desktop) => {
		desktop.createFolderLink("Documenti", (link) => {
			if (link.isLink())
				link.setLinkedPath(documentsPath);
		}).createFile(archivio.name, undefined, (file) => {
			file.setSource(FILE_SCHEMES.app + archivio.id)
				.setIconUrl(archivio.iconUrl);
		});
	});
}

export const virtualDriveConfig: Partial<VirtualDriveConfigOptions> = {
	// Nessuna persistenza: ad ogni avvio il sistema riparte pulito.
	saveData: false,
	defaultData: {
		// Disattiva i contenuti dimostrativi di ProzillaOS (alcuni sono online).
		includePicturesFolder: false,
		includeAudioFolder: false,
		includeVideoFolder: false,
		includeDocumentsFolder: false,
		includeDesktopFolder: false,
		includeSourceTree: false,
		includeAppsFolder: false,
		includeScriptsFolder: false,
		loadData: loadEdennaData,
	},
};

import { coreTranslations, defineOverrides, plural } from "@prozilla-os/core";
import { fileExplorerTranslations } from "@prozilla-os/file-explorer";
import { textEditorTranslations } from "@prozilla-os/text-editor";

/**
 * VOCE EDENNA — PRIMA BOZZA
 *
 * Questi override sostituiscono la traduzione neutra di ProzillaOS con il tono
 * aziendale della Edenna Industries: formale (il "Lei"), rassicurante, un po' troppo cortese.
 * Il sistema non sbaglia mai: al massimo "sospende", "riallinea", "registra".
 *
 * Si cambiano solo le chiavi elencate; tutto il resto usa la traduzione neutra
 * (packages/core/src/locales, packages/apps/<app>/src/locales).
 * Per vedere tutte le chiavi disponibili: il file en.ts del pacchetto corrispondente.
 */
export const edennaOverrides = [
	defineOverrides(coreTranslations, {
		it: {
			actions: {
				ok: "Ricevuto",
				alert: "Comunicazione",
			},
			desktop: {
				reload: "Riallinea interfaccia",
				changeAppearance: "Preferenze di postazione",
			},
			window: {
				stoppedWorking: "{app} è stata sospesa per manutenzione",
				unknownError: "Anomalia non classificata. Non è richiesta alcuna azione da parte Sua.",
			},
			home: {
				title: "Menu operativo",
				shutDown: "Termina sessione",
				shutDownConfirm: "Terminare la sessione operativa? Il lavoro svolto oggi verrà registrato.",
			},
			search: {
				title: "Ricerca",
				placeholder: "Cerca tra le risorse autorizzate…",
			},
			indicators: {
				showDesktop: "Torna alla scrivania",
				network: "Rete Edenna",
				connected: "Connessione protetta",
			},
			fileTypes: {
				unknown: "Formato non riconosciuto",
				other: "Documento (.{extension})",
			},
			items: plural({ zero: "Nessun elemento", one: "{count} elemento", other: "{count} elementi" }),
		},
		en: {
			actions: {
				ok: "Understood",
				alert: "Notice",
			},
			desktop: {
				reload: "Realign interface",
				changeAppearance: "Workstation preferences",
			},
			window: {
				stoppedWorking: "{app} has been suspended for maintenance",
				unknownError: "Unclassified anomaly. No action is required on your part.",
			},
			home: {
				title: "Operations menu",
				shutDown: "End session",
				shutDownConfirm: "End your work session? Today's work will be recorded.",
			},
			search: {
				title: "Search",
				placeholder: "Search authorized resources…",
			},
			indicators: {
				showDesktop: "Back to desk",
				network: "Edenna network",
				connected: "Secure connection",
			},
			fileTypes: {
				unknown: "Unrecognized format",
				other: "Document (.{extension})",
			},
			items: plural({ zero: "No items", one: "{count} item", other: "{count} items" }),
		},
	}),
	defineOverrides(fileExplorerTranslations, {
		it: {
			app: { name: "Gestione risorse" },
			errors: {
				title: "Notifica di sistema",
				invalidPath: "Percorso non riconosciuto: \"{path}\". Le risorse esterne alla Divisione non sono accessibili.",
				protectedFolder: "Accesso non autorizzato. Questa cartella è riservata.",
			},
			properties: {
				protected: "Protetto — proprietà Edenna Industries",
			},
		},
		en: {
			app: { name: "Resource Manager" },
			errors: {
				title: "System notice",
				invalidPath: "Path not recognized: \"{path}\". Resources outside the Division are not accessible.",
				protectedFolder: "Access denied. This folder is restricted.",
			},
			properties: {
				protected: "Protected — property of Edenna Industries",
			},
		},
	}),
	defineOverrides(textEditorTranslations, {
		it: {
			app: { name: "Note di servizio" },
			title: { untitled: "Nota senza titolo" },
		},
		en: {
			app: { name: "Service Notes" },
			title: { untitled: "Untitled note" },
		},
	}),
];

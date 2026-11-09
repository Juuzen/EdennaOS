import type { FC } from "react";
import { Desktop, ModalsView, ProzillaOS, Taskbar, WindowsView, type TaskbarIndicatorsProps } from "@prozilla-os/core";
import { appsConfig } from "./config/apps";
import { skin } from "./config/skin";
import { virtualDriveConfig } from "./config/virtualDrive";
import { EDENNA_LOCALES, edennaOverrides } from "./locales";
import { EdennaCrt } from "./crt/EdennaCrt";

/**
 * Indicatori della barra in basso.
 *
 * Rispetto a ProzillaOS manca l'indicatore di data e ora: i giocatori non devono
 * sapere in che giorno (o anno) si trovano. Il suo posto è libero per un
 * indicatore Edenna (vedi edenna/docs/I18N.md, "Barra in basso").
 */
function EdennaIndicators() {
	return <Indicators renderCalendar={EmptySlot}/>;
}

// Taskbar.Indicators accetta gli slot (renderBattery, renderCalendar…), ma il suo tipo li perde.
const Indicators = Taskbar.Indicators as FC<TaskbarIndicatorsProps>;

/** Slot vuoto: nasconde un elemento predefinito della barra. */
function EmptySlot() {
	return null;
}

export function App() {
	return <EdennaCrt>
		<ProzillaOS
			systemName="Edenna OS"
			tagLine="Edenna Industries — Divisione Altrove"
			skin={skin}
			config={{
				apps: appsConfig,
				virtualDrive: virtualDriveConfig,
				// Nessun Google Analytics: il kiosk è offline e non deve tracciare nulla.
				tracking: { enabled: false },
				// Lingua: si parte in italiano, il pulsante nella barra passa all'inglese.
				// La lingua torna all'italiano ad ogni riavvio o reset (Ctrl+Alt+Shift+R).
				locale: {
					locale: EDENNA_LOCALES[0],
					fallbackLocale: "en",
					availableLocales: EDENNA_LOCALES,
					overrides: edennaOverrides,
				},
			}}
		>
			<Taskbar renderIndicators={EdennaIndicators}/>
			<WindowsView/>
			<ModalsView/>
			<Desktop/>
		</ProzillaOS>
	</EdennaCrt>;
}

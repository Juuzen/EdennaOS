import { Desktop, ModalsView, ProzillaOS, Taskbar, WindowsView } from "@prozilla-os/core";
import { appsConfig } from "./config/apps";
import { skin } from "./config/skin";
import { virtualDriveConfig } from "./config/virtualDrive";

export function App() {
	return <ProzillaOS
		systemName="Edenna OS"
		tagLine="Edenna Industries — Divisione Altrove"
		skin={skin}
		config={{
			apps: appsConfig,
			virtualDrive: virtualDriveConfig,
			// Nessun Google Analytics: il kiosk è offline e non deve tracciare nulla.
			tracking: { enabled: false },
		}}
	>
		<Taskbar/>
		<WindowsView/>
		<ModalsView/>
		<Desktop/>
	</ProzillaOS>;
}

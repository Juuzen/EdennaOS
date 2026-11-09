import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/600.css";
import { App } from "./App";
// Importato dopo App, così le regole Edenna sovrascrivono quelle di ProzillaOS.
import "./styles/edenna.css";
import { installKioskGuards } from "./kioskGuards";

installKioskGuards();

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App/>
	</React.StrictMode>
);

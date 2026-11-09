import { useClassNames, useTranslation, useWindowsManager } from "../../../../hooks";
import styles from "./TaskbarDesktopButton.module.css";

export function TaskbarDesktopButton() {
	const windowsManager = useWindowsManager();
	const { t } = useTranslation(); // [Edenna]

	return <button
		title={t("indicators.showDesktop")}
		className={useClassNames([styles.DesktopButton], "Taskbar", "UtilIcon", "Desktop")}
		onClick={() => { windowsManager?.minimizeAll(); }}
	/>;
}
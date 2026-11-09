import { ReactSVG } from "react-svg";
import styles from "./StandaloneHeader.module.css";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../_utils/button/Button";
import { useSystemManager } from "../../hooks/system/systemManagerContext";
import { useTranslation } from "../../hooks/i18n/translation";

interface StandaloneHeaderProps {
	/** Function that closes standalone mode. */
	exit: () => void;
}

/**
 * Component that contains the header for standalone mode.
 */
export function StandaloneHeader({ exit }: StandaloneHeaderProps) {
	const { systemName, skin } = useSystemManager();
	const { t } = useTranslation(); // [Edenna]

	return <header className={styles.Header}>
		<a className={styles.Logo} href="/" tabIndex={0}>
			<ReactSVG src={skin.systemIcon}/>
			<h1>{systemName}</h1>
		</a>
		<Button className={styles.ExitButton} onClick={exit} icon={faTimes}>
			{t("standalone.exit")}
		</Button>
	</header>;
}
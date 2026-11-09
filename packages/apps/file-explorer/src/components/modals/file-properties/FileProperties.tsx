import styles from "./FileProperties.module.css";
import { ImagePreview, ModalProps, StorageManager, useSystemManager, useTranslation, utilStyles, VirtualFile, WindowedModal } from "@prozilla-os/core";
import { fileExplorerTranslations } from "../../../locales";

interface FilePropetiesProps extends ModalProps {
	file: VirtualFile;
}

export function FileProperties({ modal, params, file, ...props }: FilePropetiesProps) {
	const { appsConfig } = useSystemManager();
	// [Edenna] Translations
	const { t } = useTranslation(fileExplorerTranslations);
	const { t: tCore } = useTranslation();
	const associatedApp = file.extension != null ? appsConfig.getAppByFileExtension(file.extension) : null;

	return <WindowedModal className={styles.FileProperties} modal={modal} params={params} {...props}>
		<span className={styles.Section}>
			<ImagePreview className={styles.Icon} source={file.getIconUrl()}/>
			<p className={`${styles.Line} ${utilStyles.TextBold}`}>{file.id}</p>
		</span>
		<span className={styles.Section}>
			<p className={styles.Line}>{t("properties.type", { type: file.getType(tCore) })}</p>
			{associatedApp != null &&
				<span className={styles.Line}>
					{t("properties.opensWith")}{" "}
					<ImagePreview className={styles.AppIcon} source={associatedApp.iconUrl ?? ""}/>
					{associatedApp.name}
				</span>
			}
		</span>
		<span className={styles.Section}>
			<p className={styles.Line}>{t("properties.location", { path: file.path })}</p>
			<p className={styles.Line}>{t("properties.size", { size: StorageManager.getByteSize(file.source ?? file.content as string | null) })}</p>
			<p className={styles.Line}>{t("properties.sizeOnDrive", { size: StorageManager.getByteSize(file.toString()) })}</p>
		</span>
		<span className={styles.Section}>
			<p className={styles.Line}>{t("properties.attributes", { attributes: file.isProtected ? t("properties.protected") : t("properties.none") })}</p>
		</span>
	</WindowedModal>;
}
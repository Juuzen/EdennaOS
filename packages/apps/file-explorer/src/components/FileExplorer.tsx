import { ChangeEventHandler, FC, KeyboardEventHandler, useCallback, useEffect, useState } from "react";
import styles from "./FileExplorer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faCaretLeft, faCaretRight, faCircleInfo, faCog, faFolder, faPlus, faSearch, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { QuickAccessButton } from "./QuickAccessButton";
import { ImportButton } from "./ImportButton";
import { Actions, ClickAction, CODE_EXTENSIONS, DialogBox, DirectoryList, Divider, FileEventHandler, FolderEventHandler, ModalProps, ModalsConfig, OnSelectionChangeParams, useAlert, useContextMenu, useHistory, useQuickAccessLabel, useSystemManager, useTranslation, useVirtualRoot, useWindowedModal, useWindowsManager, utilStyles, VirtualFile, VirtualFolder, VirtualFolderLink, VirtualRoot, WindowProps } from "@prozilla-os/core";
import { fileExplorerTranslations } from "../locales";
import { SELECTOR_MODE } from "../constants/fileExplorer.const";
import { FileProperties } from "./modals/file-properties/FileProperties";
import { JSX } from "react/jsx-runtime";
import { Vector2 } from "@prozilla-os/shared";

export interface FileExplorerProps extends WindowProps {
	path?: string;
	selectorMode?: number;
	Footer?: FC;
	onSelectionChange?: (params: OnSelectionChangeParams) => void;
	onSelectionFinish?: (params: OnSelectionChangeParams) => void;
}

export function FileExplorer({ app, path: startPath, selectorMode, Footer, onSelectionChange, onSelectionFinish }: FileExplorerProps) {
	const isSelector = selectorMode != null && selectorMode !== SELECTOR_MODE.NONE;

	const virtualRoot = useVirtualRoot();
	const windowsManager = useWindowsManager();
	const { windowsConfig, virtualDriveConfig } = useSystemManager();
	// [Edenna] Translations
	const { t } = useTranslation(fileExplorerTranslations);
	const { t: tCore } = useTranslation();
	const getPlaceLabel = useQuickAccessLabel();

	const [currentDirectory, setCurrentDirectory] = useState<VirtualFolder | null>(virtualRoot ? virtualRoot.navigateToFolder(startPath ?? "~") : null);
	const [path, setPath] = useState<string>(currentDirectory?.path ?? "");
	const [showHidden] = useState(true);
	const { history, stateIndex, pushState, undo, redo, undoAvailable, redoAvailable } = useHistory<string>(currentDirectory?.path ?? "");
	const { alert } = useAlert();

	const { openWindowedModal } = useWindowedModal();
	const { onContextMenu: onContextMenuFile } = useContextMenu({ Actions: (props) =>
		<Actions {...props}>
			<ClickAction label={!isSelector ? tCore("actions.open") : t("actions.select")} onTrigger={(_event, file) => {
				if (isSelector) {
					onSelectionChange?.({ files: [(file as VirtualFile).id], directory: currentDirectory! });
					onSelectionFinish?.({ files: [(file as VirtualFile).id], directory: currentDirectory! });
					return;
				}
				if (windowsManager != null)	(file as VirtualFile).open(windowsManager);
			}}/>
			{(props.triggerParams as VirtualFile).isDownloadable() && 
				<ClickAction label={t("actions.export")} icon={faUpload} onTrigger={(_event, file) => {
					(file as VirtualFile).download();
				}}/>
			}			
			<ClickAction label={tCore("actions.delete")} icon={faTrash} onTrigger={(_event, file) => {
				(file as VirtualFile).delete();
			}}/>
			<ClickAction label={t("actions.properties")} icon={faCircleInfo} onTrigger={(_event, file) => {
				openWindowedModal({
					title: `${(file as VirtualFile).id} ${windowsConfig.titleSeparator} ${t("properties.title")}`,
					iconUrl: (file as VirtualFile).getIconUrl(),
					size: new Vector2(400, 500),
					Modal: (props: object) => <FileProperties file={file as VirtualFile} {...props}/>,
				});
			}}/>
		</Actions>,
	});
	const { onContextMenu: onContextMenuFolder } = useContextMenu({ Actions: (props) =>
		<Actions {...props}>
			<ClickAction label={tCore("actions.open")} onTrigger={(_event, folder) => {
				changeDirectory((folder as VirtualFolderLink).linkedPath ?? (folder as VirtualFolder).name);
			}}/>
			{/* <ClickAction label={`Open in ${APP_NAMES.TERMINAL}`} icon={APP_ICONS.TERMINAL} onTrigger={(event, folder) => {
				windowsManager?.open(APPS.TERMINAL, { startPath: (folder as VirtualFolder).path });
			}}/> */}
			<Divider/>
			<ClickAction label={tCore("actions.delete")} icon={faTrash} onTrigger={(_event, folder) => {
				(folder as VirtualFolder).delete();
			}}/>
		</Actions>,
	});
	// const { onContextMenu: onNew } = useContextMenu({
	// 	modalsManager,
	// 	options: {
	// 		"File": () => { currentDirectory.createFile("New File"); },
	// 		"Folder": () => { currentDirectory.createFolder("New Folder"); }
	// 	}
	// });

	const changeDirectory = useCallback((path: string, absolute = false) => {
		if (currentDirectory == null)
			absolute = true;

		const directory = absolute ? virtualRoot?.navigate(path) : currentDirectory?.navigate(path);

		if (directory != null) {
			setCurrentDirectory(directory as VirtualFolder);
			setPath(directory.root ? "/" : directory.path);
			pushState(directory.path);
		}
	}, [currentDirectory, pushState, virtualRoot]);

	useEffect(() => {
		if (history.length === 0)
			return;

		const path = history[stateIndex];
		const directory = virtualRoot?.navigate(path);
		if (directory != null) {
			setCurrentDirectory(directory as VirtualFolder);
			setPath(directory.root ? "/" : directory.path);
		}
	}, [history, stateIndex, virtualRoot]);

	useEffect(() => {
		type Error = { message: string };
		const onError = (error: unknown) => {
			alert({
				title: (error as Error).message,
				text: t("errors.storageFull"),
				iconUrl: app?.iconUrl as string | undefined,
				size: new Vector2(300, 200),
				single: true,
			});
		};

		virtualRoot?.on(VirtualRoot.ERROR_EVENT, onError);

		return () => {
			virtualRoot?.off(VirtualRoot.ERROR_EVENT, onError);
		};
	}, []);

	const onPathChange = (event: Event) => {
		setPath((event.target as HTMLInputElement).value);
	};

	const onKeyDown = (event: KeyboardEvent) => {
		let value = (event.target as HTMLInputElement).value;

		if (event.key === "Enter") {
			if (value === "")
				value = "~";

			const directory = virtualRoot?.navigate(value);

			if (directory == null) {
				openWindowedModal({
					title: t("errors.title"),
					iconUrl: app?.iconUrl as string | undefined,
					size: new Vector2(300, 150),
					Modal: (props: JSX.IntrinsicAttributes & ModalProps) =>
						<DialogBox {...props}>
							<p>{t("errors.invalidPath", { path: value })}</p>
							<button data-type={ModalsConfig.DIALOG_CONTENT_TYPES.closeButton}>{tCore("actions.ok")}</button>
						</DialogBox>,
				});
				return;
			} else if (directory.isFolder()) {
				setCurrentDirectory(directory);
				setPath(directory.root ? "/" : directory.path);
			}
		}
	};

	const itemCount = currentDirectory?.getItemCount(showHidden) ?? 0;

	return (
		<div className={!isSelector ? styles.FileExplorer : `${styles.FileExplorer} ${styles.Selector}`}>
			<div className={styles.Header}>
				<button
					title={t("toolbar.back")}
					tabIndex={0}
					className={styles.IconButton}
					onClick={() => { undo(); }}
					disabled={!undoAvailable}
				>
					<FontAwesomeIcon icon={faCaretLeft}/>
				</button>
				<button
					title={t("toolbar.forward")}
					tabIndex={0}
					className={styles.IconButton}
					onClick={() => { redo(); }}
					disabled={!redoAvailable}
				>
					<FontAwesomeIcon icon={faCaretRight}/>
				</button>
				<button
					title={t("toolbar.up")}
					tabIndex={0}
					className={styles.IconButton}
					onClick={() => { changeDirectory(".."); }}
					disabled={currentDirectory?.isRoot != null && currentDirectory.isRoot}
				>
					<FontAwesomeIcon icon={faArrowUp}/>
				</button>
				<button
					title={t("toolbar.new")}
					tabIndex={0}
					className={styles.IconButton}
					onClick={() => {
						openWindowedModal({
							title: t("errors.title"),
							iconUrl: app?.iconUrl as string | undefined,
							size: new Vector2(300, 150),
							Modal: (props: JSX.IntrinsicAttributes & ModalProps) =>
								<DialogBox {...props}>
									<p>{t("errors.protectedFolder")}</p>
									<button data-type={ModalsConfig.DIALOG_CONTENT_TYPES.closeButton}>{tCore("actions.ok")}</button>
								</DialogBox>,
						});

						// if (currentDirectory.canBeEdited) {
						// 	onNew(event);
						// } else {
							
						// }
					}}
					disabled={!currentDirectory?.canBeEdited}
				>
					<FontAwesomeIcon icon={faPlus}/>
				</button>
				<input
					value={path}
					type="text"
					aria-label={t("toolbar.path")}
					className={styles.PathInput}
					tabIndex={0}
					onChange={onPathChange as unknown as ChangeEventHandler}
					onKeyDown={onKeyDown as unknown as KeyboardEventHandler}
					placeholder={t("toolbar.pathPlaceholder")}
				/>
				<ImportButton directory={currentDirectory!} title={t("toolbar.import")}/>
				<button title={t("toolbar.search")} tabIndex={0} className={styles.IconButton}>
					<FontAwesomeIcon icon={faSearch}/>
				</button>
				<button title={t("toolbar.settings")} tabIndex={0} className={styles.IconButton}>
					<FontAwesomeIcon icon={faCog}/>
				</button>
			</div>
			<div className={styles.Body}>
				<div className={styles.Sidebar}>
					{/* [Edenna] Places come from virtualDriveConfig.quickAccess. */}
					{virtualDriveConfig.quickAccess.map((place) =>
						<QuickAccessButton
							key={place.path}
							name={getPlaceLabel(place)}
							onClick={() => { changeDirectory(place.path, true); }}
							icon={place.icon ?? faFolder}
						/>
					)}
				</div>
				<DirectoryList
					directory={currentDirectory!} 
					id="main"
					className={styles.Main}
					showHidden={showHidden}
					onOpenFile={(event, file) => {
						event.preventDefault();
						if (isSelector)
							return void onSelectionFinish?.({ files: [file.id], directory: currentDirectory! });
						const options: Record<string, string> = {};
						if (file.extension === "md" || file.extension != null && CODE_EXTENSIONS.includes(file.extension))
							options.mode = "view";
						windowsManager?.openFile(file, options);
					}}
					onOpenFolder={(_event, folder) => {
						changeDirectory((folder as VirtualFolderLink).linkedPath ?? folder.name);
					}}
					onContextMenuFile={onContextMenuFile as unknown as FileEventHandler}
					onContextMenuFolder={onContextMenuFolder as unknown as FolderEventHandler}
					allowMultiSelect={selectorMode !== SELECTOR_MODE.SINGLE}
					onSelectionChange={onSelectionChange}
				/>
			</div>
			{!isSelector
				? <span className={styles.Footer}>
					<p className={utilStyles.TextLight}>
						{tCore("items", { count: itemCount })}
					</p>
				</span>
				: Footer && <div className={styles.Footer}>
					<Footer/>
				</div>
			}
		</div>
	);
}
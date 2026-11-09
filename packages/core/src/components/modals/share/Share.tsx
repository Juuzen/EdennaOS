import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { ModalsManager } from "../../../features/modals/modalsManager";
import { WindowedModal } from "../_utils/WindowedModal";
import styles from "./Share.module.css";
import { copyToClipboard, generateUrl } from "../../../features/_utils/browser.utils";
import utilStyles from "../../../styles/utils.module.css";
import { Button } from "../../_utils/button/Button";
import { Option } from "./Option";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import { useAlert } from "../../../hooks/modals/alert";
import { ModalProps } from "../ModalView";
import { useScrollWithShadow } from "../../../hooks/_utils/scrollWithShadows";
import { useSystemManager, useTranslation } from "../../../hooks";
import type { TranslationKey } from "../../../features/i18n/types";
import type { CoreTranslationTree } from "../../../locales";

// [Edenna] Labels are keys of the core translations.
const APP_OPTIONS: Record<string, { label: TranslationKey<CoreTranslationTree>, name: string }[]> = {
	"terminal": [
		{
			label: "share.command",
			name: "input",
		},
		{
			label: "share.path",
			name: "path",
		},
	],
	"browser": [
		{
			label: "share.website",
			name: "url",
		},
	],
	"file-explorer": [
		{
			label: "share.path",
			name: "path",
		},
	],
	"text-editor": [
		{
			label: "share.path",
			name: "path",
		},
	],
};

export function Share({ modal, params, ...props }: ModalProps) {
	const { appsConfig } = useSystemManager();
	const { t } = useTranslation(); // [Edenna]
	const [appId, setAppId] = useState<string>(params?.appId ?? "");
	const [fullscreen, setFullscreen] = useState<boolean>(params?.fullscreen ?? false);
	const [standalone, setStandalone] = useState<boolean>(params?.standalone ?? false);
	const [options, setOptions] = useState({});
	const [url, setUrl] = useState<string | null>(null);
	const { alert } = useAlert();
	const formRef = useRef<HTMLFormElement>(null);
	const { boxShadow, onUpdate } = useScrollWithShadow({
		ref: formRef,
		horizontal: false,
		dynamicOffsetFactor: 1,
		shadow: {
			offset: 20,
			blurRadius: 10,
			spreadRadius: -10,
			color: { a: 25 },
		},
	});

	useEffect(() => {
		setUrl(generateUrl({
			appId: appId !== "" ? appId : undefined,
			fullscreen,
			standalone,
			...options,
		}));
	}, [appId, fullscreen, standalone, options]);

	useEffect(() => {
		onUpdate({ target: formRef.current });
	}, [appId]);

	const onAppIdChange = (event: Event) => {
		const newAppId = (event.target as HTMLInputElement).value;

		if (newAppId === appId)
			return;

		setAppId(newAppId);
	};

	const onFullscreenChange = (event: Event) => {
		const newFullscreen = (event.target as HTMLInputElement).checked;
		setFullscreen(newFullscreen);
	};

	const onStandaloneChange = (event: Event) => {
		const newStandalone = (event.target as HTMLInputElement).checked;
		setStandalone(newStandalone);
	};

	const setOption = (name: string, value: string) => {
		setOptions((options: Record<string, string> = {}) => {
			options = { ...options };
			options[name] = value;
			return options;
		});
	};

	return <WindowedModal className={styles.Share} modal={modal} params={{
		...params,
		title: t("share.title"),
		iconUrl: ModalsManager.getModalIconUrl("share"),
	}} {...props}>
		<div className={styles.Top}>
			<h1 className={styles.Title}>{t("share.options")}</h1>
			<div className={styles.FormContainer} style={{ boxShadow }}>
				<form
					className={styles.Form}
					onScroll={onUpdate}
					ref={formRef}
				>
					<label className={styles.Label}>
						<p>{t("share.app")}</p>
						<select className={styles.Input} name="app" value={appId} onChange={onAppIdChange as unknown as ChangeEventHandler}>
							<option value={""}>{t("share.none")}</option>
							{appsConfig.apps.map(({ name, id }) =>
								<option key={id} value={id}>{name}</option>
							)}
						</select>
					</label>
					{appId !== "" ? <label className={styles.Label}>
						<p>{t("share.standalone")}</p>
						<input
							className={styles.Input}
							name="standalone"
							type="checkbox"
							checked={standalone}
							value={standalone.toString()}
							onChange={onStandaloneChange as unknown as ChangeEventHandler}
						/>
						<div className={styles.Checkbox}>
							{standalone 
								? <FontAwesomeIcon icon={faSquareCheck}/>
								: <FontAwesomeIcon icon={faSquare}/>
							}
						</div>
					</label> : null}
					{appId !== "" ? <label className={styles.Label}>
						<input
							className={styles.Input}
							name="fullscreen"
							type="checkbox"
							checked={fullscreen}
							disabled={standalone}
							value={fullscreen.toString()}
							onChange={onFullscreenChange as unknown as ChangeEventHandler}
						/>
						<p>{t("share.fullscreen")}</p>
						<div className={styles.Checkbox}>
							{fullscreen 
								? <FontAwesomeIcon icon={faSquareCheck}/>
								: <FontAwesomeIcon icon={faSquare}/>
							}
						</div>
					</label> : null}
					{/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
					{APP_OPTIONS[appId]?.map(({ label, name }) =>
						<Option key={name} name={name} label={t(label)} setOption={setOption}/>
					)}
				</form>
			</div>
		</div>
		<div className={styles.Bottom}>
			<p className={`${styles.Url} ${utilStyles.TextLight}`}>{url}</p>
			<Button
				className={`${styles.Button} ${utilStyles.TextBold}`}
				onClick={() => {
					copyToClipboard(url as string, () => {
						alert({
							title: t("share.title"),
							iconUrl: ModalsManager.getModalIconUrl("share"),
							text: t("share.copied"),
						});
					}, () => {
						alert({
							title: t("share.title"),
							iconUrl: ModalsManager.getModalIconUrl("share"),
							text: t("share.copyFailed"),
						});
					});
				}}
			>
				{t("share.copy")}
			</Button>
		</div>
	</WindowedModal>;
}
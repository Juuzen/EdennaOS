import { useEffect, useState } from "react";
import { useAlert } from "../../hooks/modals/alert";
import { useSystemManager, useTranslation } from "../../hooks";
import { App } from "../../features";
import { FallbackProps } from "react-error-boundary";
import { Vector2 } from "@prozilla-os/shared";

export interface WindowFallbackViewProps extends FallbackProps {
	error: unknown;
	app?: App;
	closeWindow?: () => void;
}

export function WindowFallbackView({ error, app, closeWindow }: WindowFallbackViewProps): undefined {
	const { appsConfig } = useSystemManager();
	const { alert } = useAlert();
	const { t } = useTranslation(); // [Edenna]
	const [alerted, setAlerted] = useState(false);
	
	useEffect(() => {
		if (alerted)
			return;

		setAlerted(true);
		closeWindow?.();

		if (app != null && error != null)
			alert({
				title: t("window.stoppedWorking", { app: app.name }),
				text: error instanceof Error ? `${error.name}: ${error.message}` : t("window.unknownError"),
				iconUrl: appsConfig.getAppById(app.id)?.iconUrl as string | undefined,
				size: new Vector2(350, 150),
				single: true,
			});
	}, [alerted, alert, app?.id, app?.name, error, closeWindow, t]);

	return;
}
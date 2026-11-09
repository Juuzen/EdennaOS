import { MarkdownProps } from "../TextEditor";
import { Attributes, Children, cloneElement, DetailedHTMLProps, isValidElement, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle, faExclamationTriangle, faInfoCircle, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import styles from "../TextEditor.module.css";
import { sanitizeProps } from "../../core/_utils/sanitizeProps";
import { useTranslation } from "@prozilla-os/core";
import { textEditorTranslations } from "../../locales";

type Props = Partial<unknown> & Attributes & { children: ReactNode, className?: string };

export function MarkdownBlockquote({ children, ...props }: MarkdownProps) {
	sanitizeProps(props);
	const { t } = useTranslation(textEditorTranslations); // [Edenna]

	const formatContent = (children: ReactNode): [ReactNode, string | null] => {
		if (!children) return [null, null];

		let alertType: string | null = null;

		children = Children.map(children, (child) => {
			if (isValidElement(child)) {
				const { children, ...props } = child.props as Props;

				const [newChildren, childAlertType] = formatContent(children);

				if (childAlertType != null)
					props.className = `${styles.AlertContainer} ${styles[childAlertType + "Alert"]}`;

				return cloneElement(child, {
					...props,
					children: newChildren,
				} as Props);
			} else if (typeof child !== "string") {
				return child;
			}

			switch (child) {
				case "[!IMPORTANT]":
					child = <span className={styles.Alert}>
						<FontAwesomeIcon icon={faExclamationCircle}/>
						{t("alerts.important")}
					</span>;
					alertType = "Important";
					break;
				case "[!NOTE]":
					child = <span className={styles.Alert}>
						<FontAwesomeIcon icon={faInfoCircle}/>
						{t("alerts.note")}
					</span>;
					alertType = "Note";
					break;
				case "[!TIP]":
					child = <span className={styles.Alert}>
						<FontAwesomeIcon icon={faLightbulb}/>
						{t("alerts.tip")}
					</span>;
					alertType = "Tip";
					break;
				case "[!WARNING]":
					child = <span className={styles.Alert}>
						<FontAwesomeIcon icon={faExclamationTriangle}/>
						{t("alerts.warning")}
					</span>;
					alertType = "Warning";
					break;
				case "[!CAUTION]":
					child = <span className={styles.Alert}>
						<FontAwesomeIcon icon={faExclamationTriangle}/>
						{t("alerts.caution")}
					</span>;
					alertType = "Caution";
					break;
			}

			return child;
		});

		return [children, alertType];
	};

	return <blockquote
		{...(props as DetailedHTMLProps<React.BlockquoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>)}
		className={styles.MarkdownBlockquote}
	>
		{formatContent(children)[0]}
	</blockquote>;
}
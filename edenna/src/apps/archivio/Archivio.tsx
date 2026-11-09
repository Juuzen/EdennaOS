import { useEffect, useMemo, useState } from "react";
import type { VirtualFile, WindowProps } from "@prozilla-os/core";
import { EdocSpan, parseEdoc } from "./edoc";
import styles from "./Archivio.module.css";

export interface ArchivioProps extends WindowProps {
	/** File passato da Esplora risorse quando si apre un documento .edoc. */
	file?: VirtualFile;
}

function Spans({ spans }: { spans: EdocSpan[] }) {
	return <>
		{spans.map((span, index) => span.type === "text"
			? <span key={index}>{span.text}</span>
			// Solo una barra larga quanto il testo: il contenuto censurato non è nel DOM.
			: <span key={index} className={styles.Redacted} style={{ width: `${span.length * 0.55}em` }} aria-label="omissis"/>
		)}
	</>;
}

/**
 * App di esempio: visualizzatore dei documenti interni Edenna (.edoc).
 * Usala come modello per le altre app custom.
 */
export function Archivio({ file, setTitle }: ArchivioProps) {
	const [source, setSource] = useState<string | null>(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (!file)
			return;
		let cancelled = false;
		file.read()
			.then((content) => {
				if (!cancelled)
					setSource(content ?? "");
			})
			.catch(() => {
				if (!cancelled)
					setError(true);
			});
		return () => { cancelled = true; };
	}, [file]);

	const document = useMemo(() => source != null ? parseEdoc(source) : null, [source]);

	useEffect(() => {
		if (document?.header.titolo)
			setTitle?.(document.header.titolo);
	}, [document, setTitle]);

	if (!file) {
		return <div className={styles.Empty}>
			<p>Nessun documento selezionato.</p>
			<p className={styles.Hint}>Apri un file .edoc da Esplora risorse.</p>
		</div>;
	}

	if (error)
		return <div className={styles.Empty}><p>ERRORE DI ACCESSO — documento non disponibile.</p></div>;

	if (!document)
		return <div className={styles.Empty}><p>Caricamento…</p></div>;

	const { header, blocks } = document;

	return <div className={styles.Archivio}>
		<article className={styles.Sheet}>
			<header className={styles.Header}>
				<img src="/assets/edenna/logo.svg" alt="" className={styles.Logo}/>
				<div className={styles.Meta}>
					<span className={styles.Company}>EDENNA INDUSTRIES</span>
					{header.codice && <span>Rif. {header.codice}</span>}
					{header.data && <span>{header.data}</span>}
				</div>
				{header.classificazione && <span className={styles.Classification}>{header.classificazione}</span>}
			</header>

			{header.titolo && <h1 className={styles.Title}>{header.titolo}</h1>}

			{blocks.map((block, index) => block.type === "heading"
				? <h2 key={index} className={styles.Heading}><Spans spans={block.spans}/></h2>
				: <p key={index} className={styles.Paragraph}><Spans spans={block.spans}/></p>
			)}

			<footer className={styles.Footer}>
				Documento ad uso interno. La diffusione non autorizzata è perseguibile ai sensi del contratto di impiego.
			</footer>
		</article>
	</div>;
}

/**
 * Formato .edoc — "documento Edenna".
 *
 * È un file di testo semplice, pensato per essere scritto a mano dallo staff:
 *
 *   ---
 *   codice: CAV-0001
 *   titolo: Benvenuto nella Divisione Altrove
 *   classificazione: RISERVATO
 *   data: 12/03/2031
 *   effetto: anomalia        ← facoltativo: disturbo del segnale CRT all'apertura
 *   ---
 *   # Titolo di sezione
 *   Testo normale, con una parte [[censurata]].
 *
 * - L'intestazione tra le due righe "---" è facoltativa.
 * - Le righe che iniziano con "# " diventano titoli di sezione.
 * - Le righe vuote separano i paragrafi.
 * - Il testo tra [[ e ]] viene mostrato come barra nera di censura.
 *   Il contenuto originale NON finisce nella pagina: si conserva solo la lunghezza,
 *   così non è selezionabile né copiabile dai giocatori.
 */

export interface EdocHeader {
	codice?: string;
	titolo?: string;
	classificazione?: string;
	data?: string;
	[key: string]: string | undefined;
}

export type EdocSpan =
	| { type: "text"; text: string }
	| { type: "redacted"; length: number };

export type EdocBlock =
	| { type: "heading"; spans: EdocSpan[] }
	| { type: "paragraph"; spans: EdocSpan[] };

export interface EdocDocument {
	header: EdocHeader;
	blocks: EdocBlock[];
}

const REDACTION = /\[\[(.+?)\]\]/g;

export function parseSpans(line: string): EdocSpan[] {
	const spans: EdocSpan[] = [];
	let lastIndex = 0;

	for (const match of line.matchAll(REDACTION)) {
		const index = match.index;
		if (index > lastIndex)
			spans.push({ type: "text", text: line.slice(lastIndex, index) });
		spans.push({ type: "redacted", length: match[1].length });
		lastIndex = index + match[0].length;
	}

	if (lastIndex < line.length)
		spans.push({ type: "text", text: line.slice(lastIndex) });

	return spans;
}

export function parseEdoc(source: string): EdocDocument {
	const lines = source.replace(/\r\n?/g, "\n").split("\n");
	const header: EdocHeader = {};
	let start = 0;

	if (lines[0]?.trim() === "---") {
		const end = lines.indexOf("---", 1);
		if (end > 0) {
			for (const line of lines.slice(1, end)) {
				const separator = line.indexOf(":");
				if (separator <= 0)
					continue;
				const key = line.slice(0, separator).trim().toLowerCase();
				header[key] = line.slice(separator + 1).trim();
			}
			start = end + 1;
		}
	}

	const blocks: EdocBlock[] = [];
	let paragraph: string[] = [];

	const flush = () => {
		if (paragraph.length) {
			blocks.push({ type: "paragraph", spans: parseSpans(paragraph.join(" ")) });
			paragraph = [];
		}
	};

	for (const rawLine of lines.slice(start)) {
		const line = rawLine.trim();
		if (!line) {
			flush();
		} else if (line.startsWith("# ")) {
			flush();
			blocks.push({ type: "heading", spans: parseSpans(line.slice(2)) });
		} else {
			paragraph.push(line);
		}
	}
	flush();

	return { header, blocks };
}

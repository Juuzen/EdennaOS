# Aggiungere contenuti

## Documenti .edoc

I documenti interni Edenna sono file di testo in `edenna/public/documents/`, con estensione `.edoc`. Si aprono con l'app **Archivio documenti**.

```
---
codice: ALT-0147
titolo: Nota interna — anomalie di sessione
classificazione: Riservato
data: 12/03/2031
---
# Oggetto
Segnalazione di anomalie riscontrate durante la sessione [[0146-B]].

# Descrizione
Paragrafo di testo. Le righe consecutive vengono unite.
Una riga vuota inizia un nuovo paragrafo.
```

- L'intestazione tra le righe `---` è facoltativa. I campi riconosciuti sono `codice`, `titolo`, `classificazione` e `data`. Con `effetto: anomalia`, all'apertura del documento parte un disturbo del segnale (vedi [CRT.md](CRT.md)).
- `# Testo` crea un titolo di sezione.
- `[[testo]]` diventa una **barra di censura**. Il testo censurato non viene inserito nella pagina: non si può selezionare, copiare o leggere con gli strumenti di sviluppo.

Per far comparire un nuovo documento nel filesystem virtuale, aggiungerlo all'elenco `DOCUMENTS` in `edenna/src/config/virtualDrive.ts`:

```ts
const DOCUMENTS = [
	{ name: "Benvenuto - Protocollo Cavendish", source: "/documents/benvenuto.edoc" },
	{ name: "Nuovo documento", source: "/documents/nuovo-documento.edoc" },
];
```

## Filesystem virtuale

Il contenuto di cartelle e desktop si definisce in `loadEdennaData()`, dentro `edenna/src/config/virtualDrive.ts`. Le API principali di ProzillaOS:

```ts
folder.createFolder("Nome", (sub) => { /* ... */ });
folder.createFile("nome", "txt", (file) => file.setContent("testo"));
folder.createFile("nome", "edoc", (file) => file.setSource("/documents/x.edoc"));
file.setProtected(true);                 // non modificabile né cancellabile
file.setIconUrl("/assets/...svg");
```

Il filesystem **non è persistente**: a ogni avvio (e a ogni reset con Ctrl+Alt+Shift+R) riparte dallo stato definito qui.

## App custom

Ogni app è un componente React più una definizione `App`. L'esempio completo è in `edenna/src/apps/archivio/`:

- `Archivio.tsx` è il componente che disegna il contenuto della finestra. Riceve le props della finestra (`setTitle`, `close`…) e, se l'app è stata aperta da un file, `file`.
- `index.ts` è la definizione dell'app: nome, id, icona, dimensione della finestra, estensioni di file associate.

Per crearne una nuova:

1. Copiare `edenna/src/apps/archivio/` in `edenna/src/apps/nome-app/` e modificarla. I testi vanno in `locales/` (vedi [I18N.md](I18N.md#testi-di-unapp-nuova)).
2. Aggiungerla all'elenco in `edenna/src/config/apps.ts`.
3. Se deve avere un'icona sul desktop, aggiungere un collegamento in `loadEdennaData()`, come per l'Archivio.

Documentazione di riferimento delle API: la guida "Custom app" di ProzillaOS, presente anche nel repository in `docs/src/guides/custom-app.md`. Il codice delle app standard in `packages/apps/` è a sua volta un buon esempio.

Le app nuove per Edenna vanno in `edenna/src/apps/`, non in `packages/apps/`: così restano separate dal codice di ProzillaOS.

## Testi e lingue

Tutti i testi dell'interfaccia stanno in dizionari separati, in italiano e inglese, e il tono aziendale della Edenna sta in `edenna/src/locales/overrides.ts`. Per cambiare un testo o aggiungerne di nuovi vedi **[I18N.md](I18N.md)**.

I nomi delle cartelle in barra laterale e nel menu Home si configurano con `quickAccess` in `edenna/src/config/virtualDrive.ts`.

## Grafica e tema

Tutti gli asset attuali sono **segnaposto**:

| File | Cosa sostituire |
|---|---|
| `edenna/public/assets/edenna/logo.svg` | Logo Edenna (usato nei documenti e nella favicon) |
| `edenna/public/assets/edenna/system-icon.svg` | Icona della barra in basso. Monocromatica: la barra la ricolora con il colore del tema. |
| `edenna/public/assets/edenna/wallpaper.svg` | Sfondo del desktop (può diventare un `.png`/`.jpg`; aggiornare il percorso in `edenna/src/config/skin.ts`) |
| `edenna/public/assets/edenna/icons/*.svg` | Icone delle app e dei documenti |
| `edenna/build/icon.png` | Icona dell'applicazione Linux (512×512) |
| `edenna/src/styles/edenna.css` | Palette colori e font (IBM Plex) |

Ogni risorsa deve stare in `edenna/public/`: il kiosk è offline e la Content Security Policy blocca qualsiasi file esterno.

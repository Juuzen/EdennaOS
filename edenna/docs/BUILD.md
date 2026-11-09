# Guida alla build

Questa guida spiega come è organizzato Edenna OS, come si avvia in sviluppo e come si producono i pacchetti da installare sul PC kiosk.

## Come è fatto

Il repository è un fork di ProzillaOS (vedi [FORK.md](FORK.md)): un *monorepo* gestito con **pnpm**, cioè un solo repository che contiene più pacchetti. Edenna OS è uno di questi pacchetti, `@edenna/os`, nella cartella `edenna/`.

```
┌──────────────────────────────────────────────────────────────────┐
│ Electron (edenna/electron/main.cts)                              │
│  finestra kiosk, blocco scorciatoie, protocollo edenna://os/     │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Pagina web (edenna/src)                → build in dist/web/  │ │
│ │  ┌─────────────────────────────┐  ┌────────────────────────┐ │ │
│ │  │ packages/ (ProzillaOS)      │  │ edenna/ (Edenna OS)    │ │ │
│ │  │ core, skins, shared,        │◄─┤ skin, app custom,      │ │ │
│ │  │ apps/file-explorer, …       │  │ documenti, tema        │ │ │
│ │  └─────────────────────────────┘  └────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

In pratica:

- **Vite** compila insieme il codice di `edenna/src` e i **sorgenti** dei pacchetti ProzillaOS in `packages/`, e li impacchetta in `edenna/dist/web/` (HTML, JS, CSS e i file di `edenna/public/`). Non serve compilare prima ProzillaOS. Il risultato è un sito statico che funziona senza internet.
- **TypeScript** compila il processo Electron (`edenna/electron/main.cts`) in `edenna/dist/electron/main.cjs`.
- **Electron** apre `dist/web/` a schermo intero. I file vengono serviti da un protocollo interno (`edenna://os/`), così l'app si comporta come un sito web vero (percorsi, `localStorage`, router) senza bisogno di un server.
- **electron-builder** impacchetta Electron e `dist/` in un `.deb` e in un AppImage installabili su Ubuntu.

## Requisiti

- **Node.js 22.12** o successivo (LTS).
- **pnpm 11**. Il modo più semplice per averlo è `corepack enable`, che usa la versione indicata nel `package.json` della radice. Il progetto rifiuta npm e yarn.
- **Linux** (Ubuntu consigliato) per generare il `.deb`. Da Windows si può usare **WSL2** con Ubuntu, oppure far fare la build a GitHub (vedi [Build automatica su GitHub](#build-automatica-su-github)).

Lo sviluppo (`edenna:dev`, `edenna:dev:electron`) funziona anche direttamente su Windows e macOS.

## Primo avvio

```bash
git clone https://github.com/Juuzen/EdennaOS.git
cd EdennaOS
corepack enable
pnpm install
```

`pnpm install` scarica le dipendenze di tutto il monorepo, compresi il sito demo e la documentazione di ProzillaOS. Per installare solo ciò che serve a Edenna:

```bash
pnpm install --filter "@edenna/os..."
```

Il binario di Electron (~100 MB) viene scaricato al primo avvio di un comando che lo usa (`edenna:dev:electron`, `edenna:start`). Se il download si blocca dietro un proxy o una VPN aziendale, vedi [Problemi comuni](#problemi-comuni).

## Comandi

Si lanciano dalla radice del repository:

| Comando | Cosa fa |
|---|---|
| `pnpm run edenna:dev` | Avvia solo la pagina web su http://localhost:3000, con ricarica automatica, anche per le modifiche in `packages/`. Il modo più veloce per lavorare. |
| `pnpm run edenna:dev:electron` | Come sopra, ma dentro una finestra Electron (non kiosk, con DevTools). |
| `pnpm run edenna:typecheck` | Controllo dei tipi TypeScript. |
| `pnpm run edenna:build` | Build di pagina ed Electron in `edenna/dist/`. |
| `pnpm run edenna:start` | Avvia la build in **modalità kiosk** (schermo intero, scorciatoie bloccate). Richiede `edenna:build` prima. |
| `pnpm run edenna:start:windowed` | Come sopra ma in finestra normale, con DevTools. |
| `pnpm run edenna:dist` | Build completa e pacchetti `.deb` e AppImage in `edenna/release/`. |

Dentro la cartella `edenna/` gli stessi comandi esistono senza prefisso (`pnpm dev`, `pnpm dist`, ecc.), più `dist:deb` e `dist:appimage` per un solo formato.

Per uscire dalla modalità kiosk durante i test: **Ctrl+Alt+Shift+Q**.

## Il ciclo di lavoro tipico

1. `pnpm run edenna:dev` e si lavora nel browser su http://localhost:3000.
2. Ogni tanto `pnpm run edenna:dev:electron` per vedere l'app dentro Electron.
3. Prima di una sessione di gioco: `pnpm run edenna:dist`, si copia il `.deb` da `edenna/release/` sul PC kiosk e lo si installa (vedi [KIOSK.md](KIOSK.md)).

## Struttura di `edenna/`

```
edenna/
  src/
    App.tsx               configurazione principale di ProzillaOS
    config/
      apps.ts             app installate
      skin.ts             icone, sfondo, nomi delle app
      virtualDrive.ts     contenuto del filesystem virtuale
    apps/archivio/        app di esempio: visualizzatore di documenti censurati
    styles/edenna.css     tema (colori, font)
    kioskGuards.ts        protezioni lato pagina
  public/
    assets/edenna/        grafica (SEGNAPOSTO)
    documents/            documenti .edoc
  electron/main.cts       finestra kiosk e blocchi di sicurezza
  kiosk/                  script e servizio systemd per Ubuntu
  build/icon.png          icona dell'applicazione
  electron-builder.yml    configurazione dei pacchetti Linux
  vite.config.ts          collega i pacchetti ProzillaOS ai loro sorgenti
  docs/                   queste guide
```

## Cosa finisce nel pacchetto

electron-builder (configurato in `edenna/electron-builder.yml`) include solo `dist/` (pagina e processo Electron già compilati) e l'icona.

Nessun `node_modules` viene incluso: tutto ciò che serve è già nel bundle di Vite. Per questo motivo, in `edenna/package.json` tutte le dipendenze sono `devDependencies`.

Il `.deb` installa l'app in `/opt/Edenna OS/` e crea il comando `/usr/bin/edenna-os`.

## Build automatica su GitHub

Il workflow `.github/workflows/edenna-build.yml` costruisce i pacchetti su un server Ubuntu di GitHub:

- **ad ogni push su `main`**: i pacchetti si scaricano dalla pagina della run, in *Actions → Edenna OS - Build → Artifacts*;
- **ad ogni tag `edenna-v*`**: viene creata anche una *Release* con `.deb` e AppImage allegati.

Per pubblicare una versione:

1. Aggiornare `version` in `edenna/package.json` (es. `0.2.0`) e fare il commit.
2. Creare e pubblicare il tag:

   ```bash
   git tag edenna-v0.2.0
   git push origin edenna-v0.2.0
   ```

Il prefisso `edenna-` evita confusione con i tag `v*` delle versioni di ProzillaOS presenti nella storia.

È il modo più comodo se si sviluppa da Windows: non serve una macchina Linux per la build.

## Problemi comuni

**Electron non si scarica** (il primo `edenna:start` o `edenna:dev:electron` si blocca o dà errore sul download). Di solito è colpa del proxy o della VPN. Si può riprovare a mano con `pnpm --filter @edenna/os exec install-electron`, oppure impostare un mirror: `ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ pnpm run edenna:start`.

**Schermo bianco o grigio all'avvio.** Lanciare `EDENNA_DEBUG=1 pnpm run edenna:start:windowed` per vedere nel terminale gli errori della pagina. Sul PC kiosk: `journalctl -u edenna-kiosk -f`.

**L'AppImage non parte su Ubuntu 24.04** (errore sul sandbox). Ubuntu 24.04 limita i "namespace utente" tramite AppArmor. Il `.deb` installa da solo il profilo AppArmor necessario, l'AppImage no: per il kiosk usare il `.deb`. Per una prova al volo: `./edenna-os_*.AppImage --no-sandbox`.

**Electron in WSL2 non apre finestre.** Serve WSLg (Windows 11, o Windows 10 aggiornato). In alternativa sviluppare con `pnpm run edenna:dev` e aprire http://localhost:3000 dal browser di Windows.

## Variabili d'ambiente

| Variabile | Effetto |
|---|---|
| `EDENNA_WINDOWED=1` | Finestra normale invece del kiosk, DevTools attivi (equivale a passare `--windowed`). |
| `EDENNA_DEV_URL=http://localhost:3000` | Carica il dev server di Vite invece di `dist/web/`. Impostata da `edenna:dev:electron`. |
| `EDENNA_DEBUG=1` | Stampa nel terminale i messaggi della console della pagina. |

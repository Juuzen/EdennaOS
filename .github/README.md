# Edenna OS

Finto sistema operativo aziendale della **Edenna Industries**, per il LARP *Frattura*. Gira su Ubuntu in modalità kiosk: all'accensione del PC si apre direttamente il "terminale operativo" della Divisione Altrove.

Questo repository è un **fork di [ProzillaOS](https://github.com/prozilla-os/ProzillaOS)** (licenza MIT), con la storia originale conservata. L'app Edenna vive in una cartella separata e usa i pacchetti ProzillaOS del fork direttamente dai sorgenti, così si possono modificare entrambi.

## Cosa è di chi

| Percorso | Origine | Contenuto |
|---|---|---|
| **`edenna/`** | **Edenna OS** | L'app kiosk: codice React, grafica, documenti, Electron, script per Ubuntu, guide |
| **`.github/README.md`**, **`.github/workflows/edenna-build.yml`** | **Edenna OS** | Questa pagina e la build automatica dei pacchetti |
| `packages/` | ProzillaOS | Libreria del sistema operativo: `core`, `skins`, `shared` e le app (`packages/apps/`) |
| `demo/`, `docs/`, `examples/`, `scripts/` | ProzillaOS | Sito dimostrativo, documentazione, esempi e script originali. Non usati da Edenna OS |
| tutto il resto nella radice | ProzillaOS | Configurazione del monorepo (pnpm, turbo, eslint, TypeScript) |

I file ProzillaOS modificati per Edenna sono elencati in **[edenna/docs/FORK.md](../edenna/docs/FORK.md)**, insieme alla procedura per ricevere gli aggiornamenti da ProzillaOS.

## Avvio rapido

Servono Node.js 22 e pnpm (`corepack enable` lo attiva).

```bash
pnpm install
pnpm run edenna:dev            # sviluppo nel browser: http://localhost:3000
pnpm run edenna:dev:electron   # sviluppo dentro Electron
pnpm run edenna:dist           # pacchetti .deb e AppImage in edenna/release/
```

## Documentazione

- **[edenna/docs/BUILD.md](../edenna/docs/BUILD.md)** — struttura, comandi, build e pacchetti
- **[edenna/docs/FORK.md](../edenna/docs/FORK.md)** — come funziona il fork, file ProzillaOS modificati, aggiornamenti da upstream
- **[edenna/docs/KIOSK.md](../edenna/docs/KIOSK.md)** — installare la postazione kiosk su Ubuntu
- **[edenna/docs/CONTENUTI.md](../edenna/docs/CONTENUTI.md)** — documenti `.edoc`, filesystem virtuale, app custom, grafica

## Scorciatoie staff

| | |
|---|---|
| Ctrl+Alt+Shift+R | Reset della sessione |
| Ctrl+Alt+Shift+Q | Chiude l'app |

## Licenze

- ProzillaOS: MIT, © 2023 Sieben De Beule. Vedi [`LICENSE`](../LICENSE).
- Font IBM Plex: SIL Open Font License 1.1.
- Il codice e i contenuti in `edenna/` appartengono al progetto Frattura.

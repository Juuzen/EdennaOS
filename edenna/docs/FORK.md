# Il fork di ProzillaOS

Edenna OS è costruito su un fork di [ProzillaOS](https://github.com/prozilla-os/ProzillaOS). Il repository contiene tutta la storia originale di ProzillaOS, più i commit di Edenna.

## Regola di base: cosa va dove

- **Tutto ciò che è specifico di Edenna** (grafica, documenti, app nuove, configurazione, Electron, script kiosk) va in `edenna/`.
- **Le modifiche al comportamento di ProzillaOS** (bug, testi dell'interfaccia, funzioni che mancano) si fanno direttamente nei file di `packages/`. Ogni file toccato va aggiunto alla tabella più sotto.

Prima di modificare un file di ProzillaOS conviene chiedersi se si può ottenere lo stesso risultato da `edenna/`, tramite configurazione, skin, CSS o un'app nuova. Ogni file upstream modificato è un possibile conflitto quando si aggiornerà ProzillaOS.

### Come segnare le modifiche

- Nel codice: un commento `// [Edenna] motivo della modifica` vicino alla riga cambiata.
- Nei commit: un prefisso che dica cosa si tocca, come fa già ProzillaOS (`core: …`, `file-explorer: …`, `edenna: …`).

## Come Edenna usa i pacchetti ProzillaOS

`edenna/vite.config.ts` collega ogni pacchetto `@prozilla-os/*` del monorepo al suo **sorgente** (`packages/<nome>/src/main.ts`), sia in sviluppo sia in build. Non serve compilare i pacchetti ProzillaOS a parte:

- con `pnpm run edenna:dev` una modifica in `packages/core/src/...` si vede subito nel browser;
- `pnpm run edenna:build` include direttamente il codice modificato.

Il controllo dei tipi (`edenna/tsconfig.json`) usa la stessa mappatura.

## File ProzillaOS modificati

| File | Modifica | Perché |
|---|---|---|
| `pnpm-workspace.yaml` | Aggiunta la cartella `edenna` al workspace; negati gli script di installazione di `electron` (scarica il binario da solo al primo avvio) ed `electron-winstaller` (serve solo su Windows): pnpm richiede una scelta esplicita | Rendere `edenna/` un pacchetto del monorepo |
| `package.json` (radice) | Aggiunti gli script `edenna:*` | Comandi rapidi dalla radice |
| `pnpm-lock.yaml` | Rigenerato | Dipendenze di Edenna (Electron, electron-builder…) |
| `packages/core/src/components/taskbar/indicators/battery/TaskbarBattery.tsx` | `getBattery()` → `getBattery.call(navigator)` | Bug di ProzillaOS: in Chromium la chiamata senza `this` genera "Illegal invocation" |
| `eslint.config.js` | Regola `react/jsx-no-literals` sui pacchetti tradotti; `edenna/release` ignorata | Impedire nuovi testi non tradotti |

### Sistema di traduzioni

Il sistema di traduzioni (vedi [I18N.md](I18N.md)) è la modifica più estesa. Tutte le righe toccate sono segnate con `[Edenna]`.

**File nuovi in `packages/`:**

- `core/src/features/i18n/`: il motore delle traduzioni;
- `core/src/features/system/configs/localeConfig.ts`: l'opzione `config.locale`;
- `core/src/hooks/i18n/`: `useTranslation`, `useLocale`, `useQuickAccessLabel`;
- `core/src/locales/`, `apps/file-explorer/src/locales/`, `apps/text-editor/src/locales/`: i dizionari;
- `core/src/components/taskbar/indicators/language/`: il pulsante della lingua;
- `core/test/features/i18n/`: i test.

**File modificati in `packages/`:**

- Tutti i componenti di `core` con testi visibili: desktop, finestre, barra e indicatori, menu Home e ricerca, dialoghi, condivisione, modalità autonoma, pagina 404.
- `core/src/features/apps/app.tsx`: `setTranslations()` e `applyLocale()`, per avere nomi delle app tradotti.
- `core/src/features/system/systemManager.ts`, `components/prozilla-os/ProzillaOS.tsx`, `hooks/system/systemManagerProvider.tsx`, `features/system/configs/appsConfig.ts`: collegamento di `config.locale`.
- `core/src/features/system/configs/virtualDriveConfig.ts`: nuova opzione `quickAccess`, cioè le cartelle della barra laterale e del menu Home, prima fisse a "Images" e "Documents".
- `core/src/components/_utils/directory-list/DirectoryList.tsx`: i collegamenti ad app e luoghi mostrano il nome tradotto.
- `core/src/hooks/apps/installedApps.ts`: l'elenco delle app si aggiorna quando cambia la lingua.
- `core/src/features/_utils/browser.utils.ts`: testo della conferma di spegnimento passato dall'esterno.
- `core/src/features/virtual-drive/file/virtualFile.ts`: `getType()` accetta una funzione di traduzione.
- `apps/file-explorer/src/` e `apps/text-editor/src/`: componenti tradotti e `main.ts`, che registra le traduzioni.

File **aggiunti** fuori da `edenna/`: `.github/README.md` (la pagina del repository su GitHub, che ha la precedenza sul `README.md` di ProzillaOS, lasciato intatto) e `.github/workflows/edenna-build.yml`.

I workflow originali di ProzillaOS restano in `.github/workflows/`:

- `checks.yml` controlla lint e test a ogni push. È utile anche qui per verificare le modifiche ai pacchetti.
- `deploy.yml` e `compatibility-report.yml` partono solo a mano e non servono a Edenna.

## Ricevere gli aggiornamenti da ProzillaOS

Il branch `prozilla-upstream` del repository è una copia intatta di ProzillaOS: serve da base pulita per gli aggiornamenti.

```bash
# una volta sola
git remote add upstream https://github.com/prozilla-os/ProzillaOS.git

# ad ogni aggiornamento
git fetch upstream
git switch prozilla-upstream
git merge --ff-only upstream/main
git push origin prozilla-upstream

git switch main
git merge prozilla-upstream
```

Se ci sono conflitti:

- `pnpm-lock.yaml`: si accetta una versione qualsiasi e poi si rigenera con `pnpm install`;
- file della tabella sopra: si tiene la modifica Edenna, adattandola al nuovo codice.

Poi si controlla che tutto funzioni:

```bash
pnpm install
pnpm run edenna:typecheck
pnpm run edenna:dev        # controllo a vista: desktop, finestre, documenti
```

Due punti da verificare in particolare:

- `edenna/src/styles/edenna.css` aggancia alcune classi interne di ProzillaOS (le etichette delle icone del desktop), che potrebbero cambiare nome;
- non devono comparire risorse caricate da `https://os.prozilla.dev`, perché il kiosk è offline.

## Cose da cambiare in ProzillaOS

Ora che il sorgente è nel repository, i limiti emersi con l'approccio a libreria si possono risolvere qui:

| Limite | Stato |
|---|---|
| Testi dell'interfaccia in inglese | **Risolto**: sistema di traduzioni, vedi [I18N.md](I18N.md) |
| Barra laterale di Esplora risorse con "Images" e "Documents" fissi | **Risolto**: opzione `config.virtualDrive.quickAccess` |
| Cartella utente `/home/prozilla-os` e nome host nel terminale | Da fare: `packages/core/src/features/virtual-drive/root/defaultData.ts`, `packages/core/src/constants/shell.const.ts` |
| Conferma di spegnimento con la finestra nativa del sistema | Da fare: `packages/core/src/components/taskbar/home/TaskbarHomeMenu.tsx` (sostituire `window.confirm` con un dialogo di Edenna OS) |

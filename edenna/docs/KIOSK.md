# Installare la postazione kiosk

Questa guida trasforma un PC con Ubuntu in un terminale Edenna: all'accensione si apre direttamente Edenna OS a schermo intero, senza desktop di Ubuntu, barre, notifiche o modi semplici per uscire.

> **Stato:** gli script sono pronti ma **non ancora collaudati su una macchina reale**. Provarli prima su un PC di test, o su una macchina virtuale, e tenere a portata di mano l'accesso amministratore.

## Come funziona

Invece della sessione GNOME, all'avvio parte **[cage](https://github.com/cage-kiosk/cage)**, un compositor Wayland minimale che mostra una sola applicazione a tutto schermo. Dentro cage gira solo Edenna OS. Non esistono Alt+Tab, il tasto Super, le notifiche o i popup di aggiornamento, perché non c'è un desktop.

Il tutto è un servizio systemd (`edenna-kiosk.service`) che prende il posto del login grafico (GDM):

- gira con un utente dedicato, `edenna`, senza password e senza shell;
- se l'app va in crash, systemd la riavvia dopo 2 secondi;
- i log finiscono nel journal di sistema.

## Requisiti

- Ubuntu 22.04 o 24.04, desktop o server.
- Un account amministratore (sudo) per la manutenzione.
- Il pacchetto `edenna-os_X.Y.Z_amd64.deb`, da `pnpm run edenna:dist` oppure dalle Release su GitHub.

## Installazione

Copiare sul PC il `.deb` e la cartella `edenna/kiosk/` del repository, poi, dalla cartella in cui li si è copiati:

```bash
sudo ./kiosk/install-kiosk.sh edenna-os_0.1.0_amd64.deb
sudo reboot
```

Lo script:

1. installa `cage` e il pacchetto di Edenna OS;
2. crea l'utente `edenna` e gli dà accesso a schermo, GPU, input e audio;
3. installa `/etc/systemd/system/edenna-kiosk.service` e `/etc/pam.d/edenna-kiosk`;
4. disattiva GDM e attiva il kiosk al suo posto;
5. disattiva sospensione e ibernazione.

## Durante l'evento

| Azione | Come |
|---|---|
| Resettare la postazione tra un giocatore e l'altro | **Ctrl+Alt+Shift+R**: chiude tutte le finestre e ricarica il sistema da zero. |
| Chiudere Edenna OS | **Ctrl+Alt+Shift+Q**. Il servizio non lo riavvia (è un'uscita voluta). |
| Cambiare l'effetto CRT | **Ctrl+Alt+Shift+E**: spento → terminale → anomalia (vedi [CRT.md](CRT.md)). |
| Lanciare un'anomalia | **Ctrl+Alt+Shift+G**: disturbo del segnale per 3 secondi. |
| Accedere al terminale dopo la chiusura | **Ctrl+Alt+F3** e login con l'account amministratore. |
| Riavviare il kiosk | `sudo systemctl restart edenna-kiosk` |
| Vedere i log | `journalctl -u edenna-kiosk -f` |

I giocatori non possono usare F5, F11, F12, Ctrl+R/W/Q, lo zoom con Ctrl+/−, Ctrl+Shift+I né Alt+F4. Il pulsante "Spegni" del menu di Edenna OS si limita a riavviare l'interfaccia.

Mentre Edenna OS è aperto **non è possibile** passare ad altri terminali con Ctrl+Alt+F*n*. È voluto, così un giocatore non trova una schermata di login per caso. Se serve allo staff, aggiungere l'opzione `-s` a cage nella riga `ExecStart` del servizio.

## Aggiornare l'app

```bash
sudo apt install ./edenna-os_X.Y.Z_amd64.deb
sudo systemctl restart edenna-kiosk
```

## Tornare al desktop Ubuntu

```bash
sudo ./kiosk/uninstall-kiosk.sh
sudo reboot
```

Lo script riattiva GDM e la sospensione, e rimuove il servizio kiosk. App e utente `edenna` restano installati (le istruzioni per rimuoverli sono stampate alla fine).

## Checklist di collaudo

Da verificare sulla macchina vera, prima dell'evento:

- [ ] Dopo il riavvio si apre Edenna OS senza passare dal login di Ubuntu.
- [ ] Schermo, mouse e tastiera rispondono; la risoluzione è corretta.
- [ ] Alt+Tab, Super, Alt+F4, F11, Ctrl+W, Ctrl+Alt+F3 non fanno nulla.
- [ ] Ctrl+Alt+Shift+R resetta la sessione.
- [ ] Ctrl+Alt+Shift+Q chiude l'app; Ctrl+Alt+F3 porta al login testuale.
- [ ] Terminando il processo (`sudo pkill -f edenna-os` da un'altra macchina via SSH) l'app si riavvia da sola.
- [ ] Lasciando il PC fermo 30 minuti lo schermo non si spegne e il PC non va in sospensione.
- [ ] Senza rete l'app funziona normalmente.
- [ ] Se servono suoni: l'audio esce dalle casse giuste.
- [ ] Con due monitor: Edenna OS compare su quello giusto (in caso contrario, valutare l'opzione `-m last` di cage).

## Se qualcosa non va

**Schermo nero o ritorno al login testuale.** Da un altro terminale (Ctrl+Alt+F3 se cage non è attivo, oppure via SSH):

```bash
journalctl -u edenna-kiosk -b --no-pager | tail -50
```

Cause frequenti: `cage` non installato, utente `edenna` senza i gruppi `video`/`render`, scheda video senza driver adatti a Wayland.

**Provare cage a mano**, da un terminale testuale come utente normale:

```bash
cage -- edenna-os --windowed
```

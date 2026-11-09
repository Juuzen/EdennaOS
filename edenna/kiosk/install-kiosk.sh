#!/usr/bin/env bash
# Configura un PC Ubuntu come postazione kiosk di Edenna OS.
#
# Uso:
#   sudo ./kiosk/install-kiosk.sh [percorso/del/pacchetto.deb]
#
# Cosa fa:
#   1. installa cage (compositor kiosk) e, se indicato, il pacchetto .deb di Edenna OS
#   2. crea l'utente "edenna" senza password, usato solo per il kiosk
#   3. installa il servizio systemd edenna-kiosk e lo attiva al posto di GDM
#   4. disattiva sospensione e ibernazione
#
# Per tornare al desktop normale: sudo ./kiosk/uninstall-kiosk.sh

set -euo pipefail

KIOSK_USER="edenna"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEB="${1:-}"

if [[ $EUID -ne 0 ]]; then
	echo "Va eseguito come root: sudo $0 $*" >&2
	exit 1
fi

echo "==> Installo cage"
apt-get update
apt-get install -y cage

if [[ -n "$DEB" ]]; then
	echo "==> Installo Edenna OS da $DEB"
	apt-get install -y "$(realpath "$DEB")"
fi

if [[ ! -x /usr/bin/edenna-os ]]; then
	echo "Edenna OS non risulta installato (/usr/bin/edenna-os mancante)." >&2
	echo "Passa il file .deb come argomento: sudo $0 edenna-os_X.Y.Z_amd64.deb" >&2
	exit 1
fi

echo "==> Creo l'utente $KIOSK_USER"
if ! id "$KIOSK_USER" &>/dev/null; then
	useradd --create-home --shell /usr/sbin/nologin --comment "Edenna OS kiosk" "$KIOSK_USER"
fi
# Accesso a schermo, GPU e dispositivi di input.
for group in video render input audio; do
	if getent group "$group" >/dev/null; then
		usermod -aG "$group" "$KIOSK_USER"
	fi
done

echo "==> Installo servizio systemd e configurazione PAM"
install -m 0644 "$SCRIPT_DIR/edenna-kiosk.pam" /etc/pam.d/edenna-kiosk
install -m 0644 "$SCRIPT_DIR/edenna-kiosk.service" /etc/systemd/system/edenna-kiosk.service
systemctl daemon-reload

echo "==> Sostituisco il login grafico (GDM) con il kiosk"
# Il servizio kiosk si registra come display-manager: quello attuale va disattivato.
systemctl disable gdm.service 2>/dev/null || true
rm -f /etc/systemd/system/display-manager.service
systemctl enable edenna-kiosk.service
systemctl set-default graphical.target

echo "==> Disattivo sospensione e ibernazione"
systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target

cat <<EOF

Fatto. Al prossimo riavvio il PC aprirà direttamente Edenna OS.

  Riavvia ora:                     sudo reboot
  Log dell'app:                    journalctl -u edenna-kiosk -f
  Reset sessione (staff):          Ctrl+Alt+Shift+R
  Chiudi l'app (staff):            Ctrl+Alt+Shift+Q, poi Ctrl+Alt+F3 per il login testuale
  Ripristinare il desktop Ubuntu:  sudo $SCRIPT_DIR/uninstall-kiosk.sh
EOF

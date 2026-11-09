#!/usr/bin/env bash
# Rimuove la configurazione kiosk e riattiva il normale desktop Ubuntu (GDM).
# Non disinstalla Edenna OS né cancella l'utente "edenna".
#
# Uso: sudo ./kiosk/uninstall-kiosk.sh

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
	echo "Va eseguito come root: sudo $0" >&2
	exit 1
fi

systemctl disable --now edenna-kiosk.service 2>/dev/null || true
rm -f /etc/systemd/system/edenna-kiosk.service /etc/pam.d/edenna-kiosk
systemctl daemon-reload

systemctl unmask sleep.target suspend.target hibernate.target hybrid-sleep.target

# Su Ubuntu il servizio reale è gdm.service (gdm3 è solo un alias).
systemctl enable gdm.service 2>/dev/null || systemctl enable gdm3.service

cat <<EOF
Configurazione kiosk rimossa. Riavvia per tornare al desktop Ubuntu: sudo reboot

Per rimuovere anche l'app e l'utente kiosk:
  sudo apt remove edenna-os
  sudo userdel -r edenna
EOF

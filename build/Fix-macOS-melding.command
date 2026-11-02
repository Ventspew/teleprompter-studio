#!/bin/bash
set -euo pipefail

clear
echo "Teleprompter Studio — macOS-melding oplossen"
echo "============================================"
echo ""
echo "macOS markeert gedownloade apps zonder Apple-notarization"
echo "soms als 'beschadigd'. Dit script verwijdert die blokkade."
echo ""

CANDIDATES=(
  "/Applications/Teleprompter Studio.app"
  "$HOME/Applications/Teleprompter Studio.app"
  "$(dirname "$0")/Teleprompter Studio.app"
  "$(dirname "$0")/../Teleprompter Studio.app"
)

APP=""
for path in "${CANDIDATES[@]}"; do
  if [ -d "$path" ]; then
    APP="$path"
    break
  fi
done

if [ -z "$APP" ]; then
  echo "App niet gevonden."
  echo "Sleep Teleprompter Studio eerst naar Programma's en run dit script opnieuw."
  echo ""
  read -r -p "Druk op Enter om te sluiten…"
  exit 1
fi

echo "Gevonden: $APP"
echo "Quarantaine verwijderen…"
xattr -cr "$APP"

echo ""
echo "Klaar. Open de app nu opnieuw (dubbelklik of Spotlight)."
echo ""
read -r -p "Druk op Enter om te sluiten…"

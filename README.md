# Teleprompter Studio

Lokale macOS-app om video’s op te nemen met een autocue (teleprompter). Handig voor vlogs, tutorials, presentaties, podcasts of wat je maar wilt opnemen terwijl je een script leest.

Alles blijft op jouw computer: geen accounts, geen cloud, geen tracking.

## Functies

- Live webcam + microfoon, apparaatkeuze, opname tot 1080p
- Automatisch scrollende autocue (snelheid, grootte, spiegelen, overlay)
- Weergavemodi: **Overlay**, **Klassiek**, **Focus**
- Achtergrond vervagen (zoals Teams), volledig lokaal
- Countdown, snelkoppelingen, woorden/duur-schatting
- Opslaan via de macOS-savedialog (MP4 of WebM)

## Vereisten

- macOS (Apple Silicon of Intel)
- [Node.js](https://nodejs.org/) 20 of nieuwer
- Camera- en microfoontoegang in **Systeeminstellingen → Privacy en beveiliging**

## Snel starten

```bash
git clone https://github.com/Ventspew/teleprompter-studio.git
cd teleprompter-studio
npm install
npm run dev
```

Dit opent Teleprompter Studio als desktopvenster.

## App bouwen (.app)

```bash
npm run build
```

Daarna:

```bash
open "release/mac-arm64/Teleprompter Studio.app"
```

Op Intel-Macs kan het pad `release/mac/` zijn. Sleep de `.app` desgewenst naar Programma’s.

> De build is lokaal unsigned. Bij de eerste start: rechtsklik → **Open** als Gatekeeper een melding toont.

Optioneel DMG:

```bash
npm run build:dmg
```

## Gebruik

1. Start de app en sta camera/microfoon toe
2. Klik **Camera starten**
3. Plak je script in het zijpaneel
4. Optioneel: **Achtergrond vervagen**
5. Kies Overlay / Klassiek / Focus
6. Druk **Opnemen** — na stoppen kies je waar het bestand wordt bewaard

## Snelkoppelingen

| Toets | Actie |
|-------|--------|
| Spatie | Autocue start/pauze |
| ↑ / ↓ | Langzamer / sneller |
| ← / → | Terug / vooruit |
| R | Opname start/stop |
| F | Focusmodus |
| Escape | Focus uit |

## Privacy

- Camera en microfoon alleen na jouw toestemming
- Geen uploads, analytics of externe teleprompterdiensten
- Script en instellingen in localStorage
- Video’s alleen lokaal opgeslagen

## Stack

Electron · React · TypeScript · Vite · Tailwind · MediaPipe (lokale person-segmentatie)

## Licentie

MIT

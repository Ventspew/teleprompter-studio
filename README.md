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

## Installeren (release)

Download de nieuwste **DMG** van de [Releases](https://github.com/Ventspew/teleprompter-studio/releases)-pagina, open het bestand en sleep **Teleprompter Studio** naar Programma’s.

### “App is beschadigd” / kan niet worden geopend

Dat komt door macOS Gatekeeper (de app is nog niet door Apple genotariseerd), niet omdat het bestand kapot is.

**Oplossing (aanbevolen):**

1. Sleep de app naar **Programma’s**
2. Open **Terminal** en plak:

```bash
xattr -cr "/Applications/Teleprompter Studio.app"
```

3. Open de app opnieuw

Of download `Fix-macOS-melding.command` bij de release, dubbelklik die, en bevestig in Systeeminstellingen indien gevraagd.

## Zelf bouwen

```bash
npm run build
```

Dit maakt een DMG + ZIP in `release/`.

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

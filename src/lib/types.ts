export type DisplayMode = "overlay" | "classic" | "focus";

export type VideoQuality = "auto" | "720p" | "1080p";

export type CountdownSeconds = 3 | 5 | 10;

export type TeleprompterSettings = {
  script: string;
  scrollSpeed: number;
  fontSize: number;
  lineHeight: number;
  textWidth: number;
  whiteOnBlack: boolean;
  mirrored: boolean;
  centered: boolean;
  overlayOpacity: number;
  wpm: number;
  displayMode: DisplayMode;
  videoQuality: VideoQuality;
  countdownSeconds: CountdownSeconds;
  syncTeleprompterWithRecord: boolean;
  backgroundBlur: boolean;
  blurAmount: number;
  videoDeviceId: string;
  audioDeviceId: string;
};

export const DEFAULT_SCRIPT = `Welkom.

Plak hier je script. De autocue scrollt automatisch terwijl je opneemt.

Tips:
- Kijk zo veel mogelijk in de camera
- Gebruik focusmodus (F) om de tekst dicht bij de webcam te zetten
- Spatie start of pauzeert de autocue
- R start of stopt de opname

Pas scrollsnelheid en tekstgrootte aan tot het prettig leest.`;

export const DEFAULT_SETTINGS: TeleprompterSettings = {
  script: DEFAULT_SCRIPT,
  scrollSpeed: 40,
  fontSize: 42,
  lineHeight: 1.55,
  textWidth: 720,
  whiteOnBlack: true,
  mirrored: false,
  centered: true,
  overlayOpacity: 0.85,
  wpm: 140,
  displayMode: "overlay",
  videoQuality: "1080p",
  countdownSeconds: 3,
  syncTeleprompterWithRecord: true,
  backgroundBlur: false,
  blurAmount: 14,
  videoDeviceId: "",
  audioDeviceId: "",
};

export const STORAGE_KEY = "teleprompter-studio-settings-v2";

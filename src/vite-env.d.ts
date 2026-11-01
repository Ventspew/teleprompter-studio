/// <reference types="vite/client" />

type MediaAccess = {
  camera: boolean;
  microphone: boolean;
};

type SaveRecordingPayload = {
  buffer: ArrayBuffer;
  defaultName: string;
};

type SaveRecordingResult = {
  saved: boolean;
  filePath?: string;
};

interface TeleprompterDesktop {
  isDesktop: true;
  getMediaAccess: () => Promise<MediaAccess>;
  saveRecording: (payload: SaveRecordingPayload) => Promise<SaveRecordingResult>;
  revealInFinder: (filePath: string) => Promise<void>;
  onMediaAccess: (callback: (access: MediaAccess) => void) => () => void;
}

interface Window {
  teleprompterDesktop?: TeleprompterDesktop;
}

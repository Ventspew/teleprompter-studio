export type BrowserSupport = {
  mediaDevices: boolean;
  getUserMedia: boolean;
  mediaRecorder: boolean;
  supported: boolean;
  message: string | null;
};

export function checkBrowserSupport(): BrowserSupport {
  if (typeof window === "undefined") {
    return {
      mediaDevices: false,
      getUserMedia: false,
      mediaRecorder: false,
      supported: false,
      message: null,
    };
  }

  const mediaDevices = Boolean(navigator.mediaDevices);
  const getUserMedia = Boolean(navigator.mediaDevices?.getUserMedia);
  const mediaRecorder = typeof MediaRecorder !== "undefined";
  const supported = mediaDevices && getUserMedia && mediaRecorder;

  let message: string | null = null;
  if (!supported) {
    message =
      "Deze browser ondersteunt geen camera-opname via MediaDevices/MediaRecorder. Gebruik een recente versie van Chrome of Safari op macOS.";
  }

  return { mediaDevices, getUserMedia, mediaRecorder, supported, message };
}

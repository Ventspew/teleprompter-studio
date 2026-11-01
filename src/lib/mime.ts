export type RecorderFormat = {
  mimeType: string;
  extension: "mp4" | "webm";
};

const CANDIDATES: RecorderFormat[] = [
  { mimeType: "video/mp4;codecs=avc1,mp4a.40.2", extension: "mp4" },
  { mimeType: "video/mp4", extension: "mp4" },
  { mimeType: "video/webm;codecs=vp9,opus", extension: "webm" },
  { mimeType: "video/webm;codecs=vp8,opus", extension: "webm" },
  { mimeType: "video/webm;codecs=vp9", extension: "webm" },
  { mimeType: "video/webm", extension: "webm" },
];

export function pickRecorderMime(): RecorderFormat | null {
  if (typeof MediaRecorder === "undefined") return null;

  for (const candidate of CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate.mimeType)) {
      return candidate;
    }
  }

  return { mimeType: "", extension: "webm" };
}

export async function saveRecordingBlob(
  blob: Blob,
  filename: string,
): Promise<{ saved: boolean; filePath?: string }> {
  if (window.teleprompterDesktop?.saveRecording) {
    const buffer = await blob.arrayBuffer();
    const result = await window.teleprompterDesktop.saveRecording({
      buffer,
      defaultName: filename,
    });
    if (result.saved && result.filePath) {
      await window.teleprompterDesktop.revealInFinder(result.filePath);
    }
    return result;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return { saved: true };
}

export function formatTimestampForFilename(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

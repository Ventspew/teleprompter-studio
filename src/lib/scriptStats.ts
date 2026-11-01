export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Count word-like tokens; keep Dutch contractions/apostrophes as one word.
  return (trimmed.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:['’][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*/g) || [])
    .length;
}

/**
 * Estimated speaking time based on WPM, with short pauses for punctuation
 * and paragraph breaks so the total feels closer to real delivery.
 */
export function estimateDurationSeconds(text: string, wpm: number): number {
  const words = countWords(text);
  if (words <= 0 || wpm <= 0) return 0;

  const speechSeconds = (words / wpm) * 60;
  const sentencePauses = (text.match(/[.!?…]+/g) || []).length * 0.4;
  const commaPauses = (text.match(/[,:;]/g) || []).length * 0.15;
  const paragraphPauses = (text.match(/\n\s*\n/g) || []).length * 0.6;

  return speechSeconds + sentencePauses + commaPauses + paragraphPauses;
}

/** How long the autocue takes at the current pixel scroll speed. */
export function estimateScrollDurationSeconds(
  scrollDistancePx: number,
  speedPxPerSec: number,
): number {
  if (scrollDistancePx <= 0 || speedPxPerSec <= 0) return 0;
  return scrollDistancePx / speedPxPerSec;
}

/** Scroll speed that finishes the script in roughly the speaking estimate. */
export function suggestedScrollSpeed(
  scrollDistancePx: number,
  durationSeconds: number,
): number {
  if (scrollDistancePx <= 0 || durationSeconds <= 0) return 90;
  return Math.round(
    Math.max(12, Math.min(140, scrollDistancePx / durationSeconds)),
  );
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatTimer(totalMs: number): string {
  const totalSeconds = Math.floor(Math.max(0, totalMs) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Soft warning when a script is likely longer than this. */
export const LONG_SCRIPT_SECONDS = 10 * 60;

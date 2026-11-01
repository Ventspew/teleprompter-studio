import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatTimestampForFilename,
  pickRecorderMime,
  saveRecordingBlob,
  type RecorderFormat,
} from "@/lib/mime";
import type { VideoQuality } from "@/lib/types";

export type RecorderStatus = "idle" | "recording" | "paused";

function videoBitsPerSecond(quality: VideoQuality): number {
  if (quality === "720p") return 2_500_000;
  if (quality === "1080p") return 5_000_000;
  return 4_000_000;
}

export function useMediaRecorder(stream: MediaStream | null) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<RecorderFormat | null>(() =>
    typeof window === "undefined" ? null : pickRecorderMime(),
  );
  const [supportsPause] = useState(() => {
    if (typeof MediaRecorder === "undefined") return false;
    return (
      typeof MediaRecorder.prototype.pause === "function" &&
      typeof MediaRecorder.prototype.resume === "function"
    );
  });
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = window.setInterval(() => {
      if (startedAtRef.current == null) return;
      setElapsedMs(accumulatedRef.current + (Date.now() - startedAtRef.current));
    }, 200);
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [clearTimer]);

  const start = useCallback(
    (quality: VideoQuality) => {
      setError(null);
      setLastBlob(null);

      if (!stream) {
        setError("Start eerst de camera voordat je opneemt.");
        return false;
      }

      if (typeof MediaRecorder === "undefined") {
        setError("MediaRecorder wordt niet ondersteund in deze browser.");
        return false;
      }

      const picked = pickRecorderMime();
      if (!picked) {
        setError("Geen ondersteund opnameformaat gevonden.");
        return false;
      }
      setFormat(picked);

      chunksRef.current = [];
      accumulatedRef.current = 0;
      setElapsedMs(0);

      try {
        const options: MediaRecorderOptions = {
          videoBitsPerSecond: videoBitsPerSecond(quality),
        };
        if (picked.mimeType) {
          options.mimeType = picked.mimeType;
        }

        const recorder = new MediaRecorder(stream, options);
        recorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.onerror = () => {
          setError("Er ging iets mis tijdens het opnemen.");
          setStatus("idle");
          clearTimer();
        };

        recorder.onstop = () => {
          clearTimer();
          startedAtRef.current = null;
          const mime =
            recorder.mimeType || picked.mimeType || "video/webm";
          const blob = new Blob(chunksRef.current, { type: mime });
          chunksRef.current = [];
          setLastBlob(blob);
          setStatus("idle");

          const extension = mime.includes("mp4") ? "mp4" : picked.extension;
          const filename = `teleprompter-${formatTimestampForFilename()}.${extension}`;
          if (blob.size > 0) {
            void saveRecordingBlob(blob, filename).then((result) => {
              if (!result.saved) {
                setError("Opslaan geannuleerd. De opname is niet bewaard.");
              }
            });
          } else {
            setError("De opname is leeg. Probeer opnieuw.");
          }
        };

        recorder.start(1000);
        startedAtRef.current = Date.now();
        setStatus("recording");
        startTimer();
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Kon de opname niet starten.",
        );
        setStatus("idle");
        return false;
      }
    },
    [clearTimer, startTimer, stream],
  );

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    try {
      if (startedAtRef.current != null) {
        accumulatedRef.current += Date.now() - startedAtRef.current;
        startedAtRef.current = null;
        setElapsedMs(accumulatedRef.current);
      }
      recorder.stop();
    } catch {
      setError("Kon de opname niet stoppen.");
      setStatus("idle");
    }
  }, []);

  const pause = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording" || !supportsPause) return;
    try {
      recorder.pause();
      if (startedAtRef.current != null) {
        accumulatedRef.current += Date.now() - startedAtRef.current;
        startedAtRef.current = null;
        setElapsedMs(accumulatedRef.current);
      }
      clearTimer();
      setStatus("paused");
    } catch {
      setError("Pauzeren wordt niet ondersteund.");
    }
  }, [clearTimer, supportsPause]);

  const resume = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "paused" || !supportsPause) return;
    try {
      recorder.resume();
      startedAtRef.current = Date.now();
      setStatus("recording");
      startTimer();
    } catch {
      setError("Hervatten mislukt.");
    }
  }, [startTimer, supportsPause]);

  const discardAndReset = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      try {
        recorder.stop();
      } catch {
        // ignore
      }
    }
    recorderRef.current = null;
    chunksRef.current = [];
    accumulatedRef.current = 0;
    startedAtRef.current = null;
    clearTimer();
    setElapsedMs(0);
    setStatus("idle");
    setLastBlob(null);
  }, [clearTimer]);

  const isActive = status === "recording" || status === "paused";

  return {
    status,
    isActive,
    elapsedMs,
    error,
    setError,
    format,
    supportsPause,
    lastBlob,
    start,
    stop,
    pause,
    resume,
    discardAndReset,
  };
}

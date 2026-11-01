import { useEffect, useRef, useState } from "react";
import {
  createBackgroundBlurStream,
  type BackgroundBlurController,
} from "@/lib/backgroundBlur";

export function useBackgroundBlur(
  sourceStream: MediaStream | null,
  enabled: boolean,
  blurAmount: number,
) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<BackgroundBlurController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    const cleanup = () => {
      controllerRef.current?.stop();
      controllerRef.current = null;
      if (requestIdRef.current === requestId) {
        setStream(null);
        setLoading(false);
      }
    };

    if (!sourceStream || !enabled) {
      cleanup();
      setError(null);
      return cleanup;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void createBackgroundBlurStream(sourceStream, blurAmount)
      .then((controller) => {
        if (cancelled || requestIdRef.current !== requestId) {
          controller.stop();
          return;
        }
        controllerRef.current?.stop();
        controllerRef.current = controller;
        controller.setBlurAmount(blurAmount);
        setStream(controller.stream);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled || requestIdRef.current !== requestId) return;
        setLoading(false);
        setStream(null);
        setError(
          err instanceof Error
            ? err.message
            : "Achtergrondvervaging kon niet worden gestart.",
        );
      });

    return () => {
      cancelled = true;
      cleanup();
    };
    // blurAmount is applied live via setBlurAmount — do not recreate the pipeline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceStream, enabled]);

  useEffect(() => {
    controllerRef.current?.setBlurAmount(blurAmount);
  }, [blurAmount]);

  return { stream, loading, error, setError };
}

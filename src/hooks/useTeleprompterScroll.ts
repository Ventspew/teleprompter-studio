
import { useCallback, useEffect, useRef, useState } from "react";

export function useTeleprompterScroll(speedPxPerSec: number) {
  const [offset, setOffset] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const offsetRef = useRef(0);
  const playingRef = useRef(false);
  const speedRef = useRef(speedPxPerSec);
  const contentHeightRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    speedRef.current = speedPxPerSec;
  }, [speedPxPerSec]);

  const maxOffset = useCallback(() => {
    return Math.max(0, contentHeightRef.current - viewportHeightRef.current * 0.35);
  }, []);

  const updateProgress = useCallback((nextOffset: number) => {
    const max = maxOffset();
    setProgress(max <= 0 ? 0 : Math.min(1, nextOffset / max));
  }, [maxOffset]);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTsRef.current = null;
  }, []);

  const play = useCallback(() => {
    if (playingRef.current) return;
    playingRef.current = true;
    setPlaying(true);
    lastTsRef.current = null;

    const step = (ts: number) => {
      if (!playingRef.current) return;
      if (lastTsRef.current == null) {
        lastTsRef.current = ts;
      }
      const deltaSec = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const max = Math.max(
        0,
        contentHeightRef.current - viewportHeightRef.current * 0.35,
      );
      const next = Math.min(max, offsetRef.current + speedRef.current * deltaSec);
      offsetRef.current = next;
      setOffset(next);
      setProgress(max <= 0 ? 0 : Math.min(1, next / max));

      if (next >= max && max > 0) {
        playingRef.current = false;
        setPlaying(false);
        if (rafRef.current != null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        lastTsRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, []);

  const pause = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    stopRaf();
  }, [stopRaf]);

  const toggle = useCallback(() => {
    if (playingRef.current) pause();
    else play();
  }, [pause, play]);

  const reset = useCallback(() => {
    pause();
    offsetRef.current = 0;
    setOffset(0);
    setProgress(0);
  }, [pause]);

  const nudge = useCallback(
    (deltaPx: number) => {
      const next = Math.max(0, Math.min(maxOffset(), offsetRef.current + deltaPx));
      offsetRef.current = next;
      setOffset(next);
      updateProgress(next);
    },
    [maxOffset, updateProgress],
  );

  const setMetrics = useCallback(
    (contentHeight: number, viewportHeight: number) => {
      contentHeightRef.current = contentHeight;
      viewportHeightRef.current = viewportHeight;
      const clamped = Math.min(offsetRef.current, maxOffset());
      if (clamped !== offsetRef.current) {
        offsetRef.current = clamped;
        setOffset(clamped);
      }
      updateProgress(offsetRef.current);
    },
    [maxOffset, updateProgress],
  );

  useEffect(() => () => stopRaf(), [stopRaf]);

  return {
    offset,
    playing,
    progress,
    play,
    pause,
    toggle,
    reset,
    nudge,
    setMetrics,
  };
}

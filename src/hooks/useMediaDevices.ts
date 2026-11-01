
import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoQuality } from "@/lib/types";

function qualityConstraints(
  quality: VideoQuality,
): MediaTrackConstraints {
  if (quality === "720p") {
    return { width: { ideal: 1280 }, height: { ideal: 720 } };
  }
  if (quality === "1080p") {
    return { width: { ideal: 1920, max: 1920 }, height: { ideal: 1080, max: 1080 } };
  }
  return { width: { ideal: 1920, max: 1920 }, height: { ideal: 1080, max: 1080 } };
}

function friendlyMediaError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      return "Camera- of microfoontoegang is geweigerd. Sta toegang toe via Systeeminstellingen → Privacy en beveiliging → Camera/Microfoon, en herstart de app.";
    }
    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      return "Geen camera of microfoon gevonden. Sluit een apparaat aan en probeer opnieuw.";
    }
    if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      return "Camera of microfoon is al in gebruik door een andere app.";
    }
    if (error.name === "OverconstrainedError") {
      return "De gekozen resolutie of het apparaat wordt niet ondersteund. Probeer een lagere kwaliteit.";
    }
    return error.message || "Kon media niet starten.";
  }
  if (error instanceof Error) return error.message;
  return "Onbekende mediafout.";
}

export function useMediaDevices() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopMeter = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    analyserRef.current = null;
    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }
    setMicLevel(0);
  }, []);

  const stopStreamTracks = useCallback((media: MediaStream | null) => {
    media?.getTracks().forEach((track) => {
      track.stop();
    });
  }, []);

  const stopCamera = useCallback(() => {
    stopMeter();
    stopStreamTracks(streamRef.current);
    streamRef.current = null;
    setStream(null);
    setActive(false);
  }, [stopMeter, stopStreamTracks]);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
    setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
  }, []);

  const startMeter = useCallback(
    (media: MediaStream) => {
      stopMeter();
      const audioTracks = media.getAudioTracks();
      if (audioTracks.length === 0) return;

      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(media);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioContextRef.current = ctx;
        analyserRef.current = analyser;

        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          const node = analyserRef.current;
          if (!node) return;
          node.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i += 1) sum += data[i];
          const avg = sum / data.length / 255;
          setMicLevel(Math.min(1, avg * 1.8));
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        // Mic meter is optional.
      }
    },
    [stopMeter],
  );

  const startCamera = useCallback(
    async (options: {
      videoDeviceId?: string;
      audioDeviceId?: string;
      quality: VideoQuality;
    }) => {
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("getUserMedia is niet beschikbaar in deze browser.");
        return null;
      }

      stopCamera();

      const video: MediaTrackConstraints = {
        ...qualityConstraints(options.quality),
        facingMode: "user",
      };
      if (options.videoDeviceId) {
        video.deviceId = { exact: options.videoDeviceId };
        delete video.facingMode;
      }

      const audio: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
      };
      if (options.audioDeviceId) {
        audio.deviceId = { exact: options.audioDeviceId };
      }

      try {
        const media = await navigator.mediaDevices.getUserMedia({ video, audio });
        streamRef.current = media;
        setStream(media);
        setActive(true);
        startMeter(media);
        await refreshDevices();
        return media;
      } catch (err) {
        setError(friendlyMediaError(err));
        setActive(false);
        return null;
      }
    },
    [refreshDevices, startMeter, stopCamera],
  );

  useEffect(() => {
    const onDeviceChange = () => {
      void refreshDevices();
    };
    navigator.mediaDevices?.addEventListener?.("devicechange", onDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener?.("devicechange", onDeviceChange);
      stopCamera();
    };
  }, [refreshDevices, stopCamera]);

  return {
    stream,
    active,
    error,
    setError,
    videoDevices,
    audioDevices,
    micLevel,
    startCamera,
    stopCamera,
    refreshDevices,
  };
}


import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  type TeleprompterSettings,
} from "@/lib/types";

function loadSettings(): TeleprompterSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<TeleprompterSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useLocalSettings() {
  const [settings, setSettings] = useState<TeleprompterSettings>(loadSettings);
  const [hydrated] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore quota / private mode failures.
    }
  }, [settings, hydrated]);

  const updateSettings = useCallback(
    (patch: Partial<TeleprompterSettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const setScript = useCallback((script: string) => {
    setSettings((prev) => ({ ...prev, script }));
  }, []);

  return { settings, updateSettings, setScript, hydrated };
}

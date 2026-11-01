
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Focus,
  Keyboard,
  MonitorPlay,
  PanelRightClose,
  PanelRightOpen,
  Shield,
  Square,
  VideoOff,
} from "lucide-react";
import { formatTimer } from "@/lib/scriptStats";
import { BackgroundBlurControls } from "@/components/camera/BackgroundBlurControls";
import { CameraPreview } from "@/components/camera/CameraPreview";
import { DeviceSelectors } from "@/components/camera/DeviceSelectors";
import { MicMeter } from "@/components/camera/MicMeter";
import { RecordControls } from "@/components/camera/RecordControls";
import { ScriptStats } from "@/components/script/ScriptStats";
import { ScriptEditor } from "@/components/teleprompter/ScriptEditor";
import { AutocueTransport } from "@/components/teleprompter/AutocueTransport";
import { TeleprompterControls } from "@/components/teleprompter/TeleprompterControls";
import { TeleprompterView } from "@/components/teleprompter/TeleprompterView";
import { useBackgroundBlur } from "@/hooks/useBackgroundBlur";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useLocalSettings } from "@/hooks/useLocalSettings";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useTeleprompterScroll } from "@/hooks/useTeleprompterScroll";
import { checkBrowserSupport } from "@/lib/browserSupport";
import type { CountdownSeconds, DisplayMode } from "@/lib/types";

export function StudioApp() {
  const { settings, updateSettings, setScript } = useLocalSettings();
  const media = useMediaDevices();
  const blur = useBackgroundBlur(
    media.stream,
    settings.backgroundBlur,
    settings.blurAmount,
  );
  const studioStream =
    settings.backgroundBlur && blur.stream ? blur.stream : media.stream;
  const recorder = useMediaRecorder(studioStream);
  const teleprompter = useTeleprompterScroll(settings.scrollSpeed);

  const [panelOpen, setPanelOpen] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [supportMessage] = useState<string | null>(
    () => checkBrowserSupport().message,
  );
  const countdownIntervalRef = useRef<number | null>(null);

  const clearCountdown = useCallback(() => {
    if (countdownIntervalRef.current != null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
  }, []);

  useEffect(() => {
    if (!recorder.isActive) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [recorder.isActive]);

  const startCamera = useCallback(async () => {
    await media.startCamera({
      videoDeviceId: settings.videoDeviceId || undefined,
      audioDeviceId: settings.audioDeviceId || undefined,
      quality: settings.videoQuality,
    });
  }, [media, settings.audioDeviceId, settings.videoDeviceId, settings.videoQuality]);

  const restartCameraWith = useCallback(
    async (patch: {
      videoDeviceId?: string;
      audioDeviceId?: string;
      videoQuality?: typeof settings.videoQuality;
    }) => {
      if (!media.active || recorder.isActive) {
        updateSettings(patch);
        return;
      }
      updateSettings(patch);
      await media.startCamera({
        videoDeviceId:
          (patch.videoDeviceId ?? settings.videoDeviceId) || undefined,
        audioDeviceId:
          (patch.audioDeviceId ?? settings.audioDeviceId) || undefined,
        quality: patch.videoQuality ?? settings.videoQuality,
      });
    },
    [media, recorder.isActive, settings, updateSettings],
  );

  const beginRecording = useCallback(() => {
    const ok = recorder.start(settings.videoQuality);
    if (ok && settings.syncTeleprompterWithRecord) {
      teleprompter.play();
    }
  }, [recorder, settings.syncTeleprompterWithRecord, settings.videoQuality, teleprompter]);

  const requestStartRecording = useCallback(() => {
    if (!media.active) {
      media.setError("Start eerst de camera.");
      return;
    }
    if (countdownIntervalRef.current != null) return;

    let remaining = settings.countdownSeconds;
    setCountdown(remaining);
    countdownIntervalRef.current = window.setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearCountdown();
        beginRecording();
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }, [beginRecording, clearCountdown, media, settings.countdownSeconds]);

  const requestStopRecording = useCallback(() => {
    if (!recorder.isActive) return;
    const confirmed = window.confirm(
      "Opname stoppen? De video wordt daarna lokaal gedownload.",
    );
    if (confirmed) recorder.stop();
  }, [recorder]);

  const requestRestartRecording = useCallback(() => {
    const confirmed = window.confirm(
      "Opname opnieuw starten? De huidige opname wordt weggegooid.",
    );
    if (!confirmed) return;
    clearCountdown();
    recorder.discardAndReset();
    teleprompter.reset();
    // Allow a fresh countdown on the next tick after discard.
    window.setTimeout(() => {
      requestStartRecording();
    }, 0);
  }, [clearCountdown, recorder, requestStartRecording, teleprompter]);

  const setDisplayMode = useCallback(
    (displayMode: DisplayMode) => {
      updateSettings({ displayMode });
      if (displayMode === "focus") setPanelOpen(false);
    },
    [updateSettings],
  );

  const shortcutHandlers = useMemo(
    () => ({
      onToggleTeleprompter: () => teleprompter.toggle(),
      onSlower: () =>
        updateSettings({
          scrollSpeed: Math.max(12, settings.scrollSpeed - 4),
        }),
      onFaster: () =>
        updateSettings({
          scrollSpeed: Math.min(140, settings.scrollSpeed + 4),
        }),
      onRewind: () =>
        teleprompter.nudge(-(settings.fontSize * settings.lineHeight * 3)),
      onForward: () =>
        teleprompter.nudge(settings.fontSize * settings.lineHeight * 3),
      onResetTeleprompter: () => teleprompter.reset(),
      onToggleRecord: () => {
        if (recorder.isActive) requestStopRecording();
        else requestStartRecording();
      },
      onToggleFocus: () => {
        setDisplayMode(settings.displayMode === "focus" ? "overlay" : "focus");
      },
      onExitFocus: () => {
        if (settings.displayMode === "focus") setDisplayMode("overlay");
      },
    }),
    [
      recorder.isActive,
      requestStartRecording,
      requestStopRecording,
      setDisplayMode,
      settings.displayMode,
      settings.fontSize,
      settings.lineHeight,
      settings.scrollSpeed,
      teleprompter,
      updateSettings,
    ],
  );

  const changeScrollSpeed = useCallback(
    (delta: number) => {
      updateSettings({
        scrollSpeed: Math.max(12, Math.min(140, settings.scrollSpeed + delta)),
      });
    },
    [settings.scrollSpeed, updateSettings],
  );

  const showAutocueTransport =
    teleprompter.playing || teleprompter.progress > 0 || teleprompter.offset > 0;

  useKeyboardShortcuts(shortcutHandlers);

  const mode = settings.displayMode;
  const focus = mode === "focus";
  const error = media.error || recorder.error || blur.error;

  const formatLabel = recorder.format
    ? recorder.format.mimeType
      ? recorder.format.extension.toUpperCase()
      : "Browser-default"
    : null;

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#090b0d] text-zinc-100">
      {!focus && (
        <header className="drag-region z-30 flex shrink-0 items-center gap-4 border-b border-white/5 px-4 py-3 pt-4 md:px-6">
          <div className="flex items-center gap-3 pl-14">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300">
              <MonitorPlay className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                Teleprompter Studio
              </h1>
              <p className="text-xs text-zinc-500">
                macOS-app · lokaal · geen cloud
              </p>
            </div>
          </div>

          <div className="no-drag ml-auto flex items-center gap-2">
            <ModeSwitch mode={mode} onChange={setDisplayMode} />
            <button
              type="button"
              className="studio-btn-ghost"
              onClick={() => setPanelOpen((v) => !v)}
              aria-label={panelOpen ? "Paneel sluiten" : "Paneel openen"}
            >
              {panelOpen ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>
      )}

      {supportMessage && (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
          {supportMessage}
        </div>
      )}

      {error && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-100">
          {error}
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => {
              media.setError(null);
              recorder.setError(null);
              blur.setError(null);
            }}
          >
            Sluiten
          </button>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <main className="relative h-full min-h-0 min-w-0 flex-1 overflow-hidden">
          {mode === "classic" ? (
            <div className="absolute inset-0 bg-black">
              <TeleprompterView
                script={settings.script}
                offset={teleprompter.offset}
                fontSize={settings.fontSize}
                lineHeight={settings.lineHeight}
                textWidth={settings.textWidth}
                whiteOnBlack={settings.whiteOnBlack}
                mirrored={settings.mirrored}
                centered={settings.centered}
                overlayOpacity={1}
                mode="classic"
                playing={teleprompter.playing}
                onMetrics={teleprompter.setMetrics}
                onScriptChange={setScript}
              />
              <div className="absolute bottom-4 right-4 h-36 w-52 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/50">
                {studioStream ? (
                  <CameraPreview stream={studioStream} />
                ) : (
                  <div className="flex h-full items-center justify-center bg-zinc-900 text-xs text-zinc-500">
                    Geen camera
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-[#0c1014]">
              {media.stream ? (
                <>
                  <div className="absolute inset-0">
                    <CameraPreview stream={studioStream ?? media.stream} />
                    {settings.backgroundBlur && blur.loading && (
                      <div className="absolute inset-x-0 top-4 z-30 flex justify-center">
                        <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-zinc-200 backdrop-blur">
                          Achtergrondvervaging laden…
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Autocue alleen over live camera — nooit over de start-UI */}
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 z-20 ${
                      mode === "focus" ? "h-[38%]" : "h-[46%]"
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-transparent" />
                    <div className="pointer-events-auto relative h-full">
                      <TeleprompterView
                        script={settings.script}
                        offset={teleprompter.offset}
                        fontSize={
                          mode === "focus"
                            ? Math.max(28, settings.fontSize - 4)
                            : settings.fontSize
                        }
                        lineHeight={settings.lineHeight}
                        textWidth={settings.textWidth}
                        whiteOnBlack={settings.whiteOnBlack}
                        mirrored={settings.mirrored}
                        centered={settings.centered}
                        overlayOpacity={settings.overlayOpacity}
                        mode={mode}
                        playing={teleprompter.playing}
                        onMetrics={teleprompter.setMetrics}
                        onScriptChange={setScript}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 z-10 px-6">
                  <div className="absolute left-1/2 top-[38%] w-full max-w-md -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <MonitorPlay className="h-8 w-8 text-teal-300" />
                    </div>
                    <p
                      className="text-2xl"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Klaar om op te nemen
                    </p>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
                      Start de camera voor een live preview. Daarna verschijnt
                      de autocue als overlay bovenin, dicht bij de webcam.
                    </p>
                    <button
                      type="button"
                      className="studio-btn-primary mt-5"
                      onClick={() => void startCamera()}
                    >
                      Camera starten
                    </button>
                    <p className="mt-5 text-xs text-zinc-600">
                      Spatie autocue · R opname · F focus
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {countdown != null && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 backdrop-blur-sm">
              <div className="flex h-36 w-36 items-center justify-center rounded-full border border-teal-300/40 bg-black/50 font-[family-name:var(--font-display)] text-7xl text-teal-200 shadow-2xl">
                {countdown}
              </div>
            </div>
          )}

          <AutocueTransport
            visible={showAutocueTransport}
            playing={teleprompter.playing}
            scrollSpeed={settings.scrollSpeed}
            progress={teleprompter.progress}
            onToggle={teleprompter.toggle}
            onReset={teleprompter.reset}
            onSlower={() => changeScrollSpeed(-4)}
            onFaster={() => changeScrollSpeed(4)}
          />

          {/* Onderbalk alleen als de camera aan staat — anders overlapt die de start-UI */}
          {media.active && !focus && (
            <div className="absolute inset-x-0 bottom-0 z-30 border-t border-white/5 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 md:p-5">
              <RecordControls
                cameraActive={media.active}
                status={recorder.status}
                elapsedMs={recorder.elapsedMs}
                supportsPause={recorder.supportsPause}
                formatLabel={formatLabel}
                onStartCamera={() => void startCamera()}
                onStopCamera={media.stopCamera}
                onStartRecord={requestStartRecording}
                onStopRecord={requestStopRecording}
                onPauseRecord={recorder.pause}
                onResumeRecord={recorder.resume}
                onRestartRecord={requestRestartRecording}
              />

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <Keyboard className="h-3.5 w-3.5" />
                  Spatie autocue · R opname · F focus · ↑↓ snelheid · ←→
                  springen
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Alles blijft op dit apparaat
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-teal-300/90 hover:text-teal-200"
                  onClick={() => teleprompter.toggle()}
                >
                  {teleprompter.playing
                    ? "Autocue pauzeert"
                    : "Autocue starten"}
                </button>
              </div>
            </div>
          )}

          {/* Focusmodus: altijd zichtbare stop-knoppen */}
          {focus && media.active && (
            <div className="absolute inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2 p-4">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-2 py-2 backdrop-blur-md">
                {recorder.isActive ? (
                  <button
                    type="button"
                    className="studio-btn-danger"
                    onClick={requestStopRecording}
                  >
                    <Square className="h-4 w-4 fill-current" />
                    Stop opname
                  </button>
                ) : (
                  <button
                    type="button"
                    className="studio-btn-record"
                    onClick={requestStartRecording}
                  >
                    Opnemen
                  </button>
                )}
                <button
                  type="button"
                  className="studio-btn-ghost"
                  onClick={media.stopCamera}
                  disabled={recorder.isActive}
                  title={
                    recorder.isActive
                      ? "Stop eerst de opname"
                      : "Camera uitschakelen"
                  }
                >
                  <VideoOff className="h-4 w-4" />
                  Camera uit
                </button>
                <span className="px-2 font-mono text-sm text-zinc-200">
                  {formatTimer(recorder.elapsedMs)}
                </span>
                {recorder.isActive && (
                  <span className="pr-2 text-xs text-red-400">REC</span>
                )}
              </div>
            </div>
          )}

          {focus && (
            <button
              type="button"
              className="absolute right-4 top-4 z-40 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-zinc-200 backdrop-blur hover:bg-black/80"
              onClick={() => setDisplayMode("overlay")}
            >
              <span className="inline-flex items-center gap-1.5">
                <Focus className="h-3.5 w-3.5" />
                Focus uit (Esc)
              </span>
            </button>
          )}
        </main>

        {!focus && panelOpen && (
          <aside className="z-20 flex h-full w-full max-w-md shrink-0 flex-col gap-5 overflow-y-auto border-l border-white/5 bg-[#0d1116]/95 p-4 backdrop-blur md:max-w-sm lg:max-w-md">
            <ScriptStats
              script={settings.script}
              wpm={settings.wpm}
              progress={teleprompter.progress}
              scrollDistance={teleprompter.scrollDistance}
              scrollSpeed={settings.scrollSpeed}
              onWpmChange={(wpm) => updateSettings({ wpm })}
              onMatchScrollSpeed={(scrollSpeed) =>
                updateSettings({ scrollSpeed })
              }
            />

            <ScriptEditor value={settings.script} onChange={setScript} />

            <section className="grid gap-3">
              <h2 className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Apparaten
              </h2>
              <DeviceSelectors
                videoDevices={media.videoDevices}
                audioDevices={media.audioDevices}
                videoDeviceId={settings.videoDeviceId}
                audioDeviceId={settings.audioDeviceId}
                videoQuality={settings.videoQuality}
                disabled={recorder.isActive}
                onVideoChange={(videoDeviceId) =>
                  void restartCameraWith({ videoDeviceId })
                }
                onAudioChange={(audioDeviceId) =>
                  void restartCameraWith({ audioDeviceId })
                }
                onQualityChange={(videoQuality) =>
                  void restartCameraWith({ videoQuality })
                }
              />
              <BackgroundBlurControls
                enabled={settings.backgroundBlur}
                blurAmount={settings.blurAmount}
                loading={blur.loading}
                disabled={!media.active}
                onEnabledChange={(backgroundBlur) =>
                  updateSettings({ backgroundBlur })
                }
                onBlurAmountChange={(blurAmount) =>
                  updateSettings({ blurAmount })
                }
              />
              <MicMeter level={media.micLevel} active={media.active} />
            </section>

            <section className="grid gap-3">
              <h2 className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Autocue
              </h2>
              <TeleprompterControls
                playing={teleprompter.playing}
                scrollSpeed={settings.scrollSpeed}
                fontSize={settings.fontSize}
                lineHeight={settings.lineHeight}
                textWidth={settings.textWidth}
                whiteOnBlack={settings.whiteOnBlack}
                mirrored={settings.mirrored}
                centered={settings.centered}
                overlayOpacity={settings.overlayOpacity}
                countdownSeconds={settings.countdownSeconds}
                syncTeleprompterWithRecord={settings.syncTeleprompterWithRecord}
                onToggle={teleprompter.toggle}
                onReset={teleprompter.reset}
                onRewind={() =>
                  teleprompter.nudge(-(settings.fontSize * settings.lineHeight * 3))
                }
                onForward={() =>
                  teleprompter.nudge(settings.fontSize * settings.lineHeight * 3)
                }
                onSpeedChange={(scrollSpeed) => updateSettings({ scrollSpeed })}
                onFontSizeChange={(fontSize) => updateSettings({ fontSize })}
                onLineHeightChange={(lineHeight) => updateSettings({ lineHeight })}
                onTextWidthChange={(textWidth) => updateSettings({ textWidth })}
                onWhiteOnBlackChange={(whiteOnBlack) =>
                  updateSettings({ whiteOnBlack })
                }
                onMirroredChange={(mirrored) => updateSettings({ mirrored })}
                onCenteredChange={(centered) => updateSettings({ centered })}
                onOverlayOpacityChange={(overlayOpacity) =>
                  updateSettings({ overlayOpacity })
                }
                onCountdownChange={(countdownSeconds: CountdownSeconds) =>
                  updateSettings({ countdownSeconds })
                }
                onSyncChange={(syncTeleprompterWithRecord) =>
                  updateSettings({ syncTeleprompterWithRecord })
                }
              />
            </section>
          </aside>
        )}
      </div>
    </div>
  );
}

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: DisplayMode;
  onChange: (mode: DisplayMode) => void;
}) {
  const items: { id: DisplayMode; label: string }[] = [
    { id: "overlay", label: "Overlay" },
    { id: "classic", label: "Klassiek" },
    { id: "focus", label: "Focus" },
  ];

  return (
    <div className="flex rounded-full border border-white/10 bg-black/30 p-1">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`rounded-full px-3 py-1.5 text-xs transition ${
            mode === item.id
              ? "bg-teal-400/20 text-teal-200"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

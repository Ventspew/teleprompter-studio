
import {
  Circle,
  Pause,
  Play,
  RotateCcw,
  Square,
  Video,
  VideoOff,
} from "lucide-react";
import { formatTimer } from "@/lib/scriptStats";
import type { RecorderStatus } from "@/hooks/useMediaRecorder";

type RecordControlsProps = {
  cameraActive: boolean;
  status: RecorderStatus;
  elapsedMs: number;
  supportsPause: boolean;
  formatLabel: string | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onPauseRecord: () => void;
  onResumeRecord: () => void;
  onRestartRecord: () => void;
};

export function RecordControls({
  cameraActive,
  status,
  elapsedMs,
  supportsPause,
  formatLabel,
  onStartCamera,
  onStopCamera,
  onStartRecord,
  onStopRecord,
  onPauseRecord,
  onResumeRecord,
  onRestartRecord,
}: RecordControlsProps) {
  const recording = status === "recording";
  const paused = status === "paused";
  const active = recording || paused;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!cameraActive ? (
        <button type="button" className="studio-btn-primary" onClick={onStartCamera}>
          <Video className="h-4 w-4" />
          Camera starten
        </button>
      ) : (
        <button
          type="button"
          className="studio-btn-ghost"
          onClick={onStopCamera}
          disabled={active}
          title={active ? "Stop eerst de opname" : "Camera uitschakelen"}
        >
          <VideoOff className="h-4 w-4" />
          Camera uit
        </button>
      )}

      {!active ? (
        <button
          type="button"
          className="studio-btn-record"
          onClick={onStartRecord}
          disabled={!cameraActive}
        >
          <Circle className="h-4 w-4 fill-current" />
          Opnemen
        </button>
      ) : (
        <>
          <button type="button" className="studio-btn-danger" onClick={onStopRecord}>
            <Square className="h-4 w-4 fill-current" />
            Stop
          </button>
          {supportsPause &&
            (paused ? (
              <button type="button" className="studio-btn-ghost" onClick={onResumeRecord}>
                <Play className="h-4 w-4" />
                Hervat opname
              </button>
            ) : (
              <button type="button" className="studio-btn-ghost" onClick={onPauseRecord}>
                <Pause className="h-4 w-4" />
                Pauzeer opname
              </button>
            ))}
          <button type="button" className="studio-btn-ghost" onClick={onRestartRecord}>
            <RotateCcw className="h-4 w-4" />
            Opnieuw
          </button>
        </>
      )}

      <div className="ml-auto flex items-center gap-3 font-mono text-sm">
        {active && (
          <span className="flex items-center gap-2 text-red-400">
            <span
              className={`h-2.5 w-2.5 rounded-full bg-red-500 ${recording ? "animate-pulse" : ""}`}
            />
            {paused ? "GEPAUZEERD" : "REC"}
          </span>
        )}
        <span className="text-zinc-200">{formatTimer(elapsedMs)}</span>
        {formatLabel && (
          <span className="hidden text-xs text-zinc-500 sm:inline">{formatLabel}</span>
        )}
      </div>
    </div>
  );
}

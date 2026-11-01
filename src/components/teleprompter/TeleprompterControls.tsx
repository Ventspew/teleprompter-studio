
import {
  ChevronsDown,
  ChevronsUp,
  Pause,
  Play,
  SkipBack,
} from "lucide-react";
import type { CountdownSeconds } from "@/lib/types";

type TeleprompterControlsProps = {
  playing: boolean;
  scrollSpeed: number;
  fontSize: number;
  lineHeight: number;
  textWidth: number;
  whiteOnBlack: boolean;
  mirrored: boolean;
  centered: boolean;
  overlayOpacity: number;
  countdownSeconds: CountdownSeconds;
  syncTeleprompterWithRecord: boolean;
  onToggle: () => void;
  onReset: () => void;
  onRewind: () => void;
  onForward: () => void;
  onSpeedChange: (value: number) => void;
  onFontSizeChange: (value: number) => void;
  onLineHeightChange: (value: number) => void;
  onTextWidthChange: (value: number) => void;
  onWhiteOnBlackChange: (value: boolean) => void;
  onMirroredChange: (value: boolean) => void;
  onCenteredChange: (value: boolean) => void;
  onOverlayOpacityChange: (value: number) => void;
  onCountdownChange: (value: CountdownSeconds) => void;
  onSyncChange: (value: boolean) => void;
};

export function TeleprompterControls({
  playing,
  scrollSpeed,
  fontSize,
  lineHeight,
  textWidth,
  whiteOnBlack,
  mirrored,
  centered,
  overlayOpacity,
  countdownSeconds,
  syncTeleprompterWithRecord,
  onToggle,
  onReset,
  onRewind,
  onForward,
  onSpeedChange,
  onFontSizeChange,
  onLineHeightChange,
  onTextWidthChange,
  onWhiteOnBlackChange,
  onMirroredChange,
  onCenteredChange,
  onOverlayOpacityChange,
  onCountdownChange,
  onSyncChange,
}: TeleprompterControlsProps) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="studio-btn-primary" onClick={onToggle}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? "Pauzeer autocue" : "Start autocue"}
        </button>
        <button type="button" className="studio-btn-ghost" onClick={onRewind} title="Terug">
          <ChevronsUp className="h-4 w-4" />
        </button>
        <button type="button" className="studio-btn-ghost" onClick={onForward} title="Vooruit">
          <ChevronsDown className="h-4 w-4" />
        </button>
        <button type="button" className="studio-btn-ghost" onClick={onReset}>
          <SkipBack className="h-4 w-4" />
          Begin
        </button>
      </div>

      <label className="grid gap-1.5 text-xs text-zinc-400">
        Scrollsnelheid ({scrollSpeed} px/s)
        <input
          type="range"
          min={12}
          max={140}
          value={Math.min(140, Math.max(12, scrollSpeed))}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="studio-range"
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { label: "Langzaam", value: 24 },
            { label: "Normaal", value: 42 },
            { label: "Vlot", value: 68 },
            { label: "Snel", value: 100 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`rounded-full px-2.5 py-1 text-[11px] transition ${
                scrollSpeed === preset.value
                  ? "bg-teal-400/20 text-teal-200"
                  : "bg-white/5 text-zinc-400 hover:text-zinc-200"
              }`}
              onClick={() => onSpeedChange(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </label>

      <label className="grid gap-1.5 text-xs text-zinc-400">
        Tekstgrootte ({fontSize}px)
        <input
          type="range"
          min={24}
          max={84}
          value={fontSize}
          onChange={(e) => onFontSizeChange(Number(e.target.value))}
          className="studio-range"
        />
      </label>

      <label className="grid gap-1.5 text-xs text-zinc-400">
        Regelafstand ({lineHeight.toFixed(2)})
        <input
          type="range"
          min={1.2}
          max={2.4}
          step={0.05}
          value={lineHeight}
          onChange={(e) => onLineHeightChange(Number(e.target.value))}
          className="studio-range"
        />
      </label>

      <label className="grid gap-1.5 text-xs text-zinc-400">
        Tekstbreedte ({textWidth}px)
        <input
          type="range"
          min={360}
          max={1100}
          step={10}
          value={textWidth}
          onChange={(e) => onTextWidthChange(Number(e.target.value))}
          className="studio-range"
        />
      </label>

      <label className="grid gap-1.5 text-xs text-zinc-400">
        Overlay-transparantie ({Math.round(overlayOpacity * 100)}%)
        <input
          type="range"
          min={0.25}
          max={1}
          step={0.05}
          value={overlayOpacity}
          onChange={(e) => onOverlayOpacityChange(Number(e.target.value))}
          className="studio-range"
        />
      </label>

      <div className="grid gap-2 text-sm text-zinc-300">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={whiteOnBlack}
            onChange={(e) => onWhiteOnBlackChange(e.target.checked)}
            className="accent-teal-400"
          />
          Witte tekst op zwart
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={mirrored}
            onChange={(e) => onMirroredChange(e.target.checked)}
            className="accent-teal-400"
          />
          Gespiegelde tekst
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={centered}
            onChange={(e) => onCenteredChange(e.target.checked)}
            className="accent-teal-400"
          />
          Tekst centreren
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={syncTeleprompterWithRecord}
            onChange={(e) => onSyncChange(e.target.checked)}
            className="accent-teal-400"
          />
          Autocue starten met opname
        </label>
      </div>

      <label className="grid gap-1.5 text-xs text-zinc-400">
        Aftellen vóór opname
        <select
          className="studio-select"
          value={countdownSeconds}
          onChange={(e) =>
            onCountdownChange(Number(e.target.value) as CountdownSeconds)
          }
        >
          <option value={3}>3 seconden</option>
          <option value={5}>5 seconden</option>
          <option value={10}>10 seconden</option>
        </select>
      </label>
    </div>
  );
}

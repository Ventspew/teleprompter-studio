import { Pause, Play, RotateCcw, Turtle, Rabbit } from "lucide-react";

type AutocueTransportProps = {
  playing: boolean;
  scrollSpeed: number;
  progress: number;
  visible: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSlower: () => void;
  onFaster: () => void;
};

export function AutocueTransport({
  playing,
  scrollSpeed,
  progress,
  visible,
  onToggle,
  onReset,
  onSlower,
  onFaster,
}: AutocueTransportProps) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-40 flex justify-center px-3">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/15 bg-black/75 px-2 py-1.5 shadow-xl backdrop-blur-md">
        <button
          type="button"
          className="rounded-full p-2 text-zinc-100 hover:bg-white/10"
          onClick={onToggle}
          title={playing ? "Pauzeer autocue (Spatie)" : "Start autocue (Spatie)"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-zinc-100 hover:bg-white/10"
          onClick={onReset}
          title="Terug naar begin"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-white/15" />
        <button
          type="button"
          className="rounded-full p-2 text-zinc-100 hover:bg-white/10"
          onClick={onSlower}
          title="Langzamer (↑)"
        >
          <Turtle className="h-4 w-4" />
        </button>
        <span className="min-w-16 px-1 text-center font-mono text-xs text-zinc-300">
          {scrollSpeed} px/s
        </span>
        <button
          type="button"
          className="rounded-full p-2 text-zinc-100 hover:bg-white/10"
          onClick={onFaster}
          title="Sneller (↓)"
        >
          <Rabbit className="h-4 w-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-white/15" />
        <span className="pr-2 font-mono text-xs text-zinc-400">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}

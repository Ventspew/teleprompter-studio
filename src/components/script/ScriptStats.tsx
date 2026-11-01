import {
  LONG_SCRIPT_SECONDS,
  countWords,
  estimateDurationSeconds,
  formatDuration,
} from "@/lib/scriptStats";

type ScriptStatsProps = {
  script: string;
  wpm: number;
  progress: number;
  onWpmChange: (wpm: number) => void;
};

export function ScriptStats({
  script,
  wpm,
  progress,
  onWpmChange,
}: ScriptStatsProps) {
  const words = countWords(script);
  const totalSeconds = estimateDurationSeconds(words, wpm);
  const remainingSeconds = totalSeconds * (1 - progress);
  const tooLong = totalSeconds > LONG_SCRIPT_SECONDS;

  return (
    <div className="grid gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Script</p>
          <p className="mt-1 text-2xl font-medium text-zinc-100">
            {words} <span className="text-base text-zinc-500">woorden</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Geschatte duur</p>
          <p className={`text-lg font-mono ${tooLong ? "text-amber-300" : "text-teal-300"}`}>
            {formatDuration(totalSeconds)}
          </p>
        </div>
      </div>

      <label className="grid gap-1.5 text-xs text-zinc-400">
        Spreeksnelheid ({wpm} wpm)
        <input
          type="range"
          min={100}
          max={180}
          value={wpm}
          onChange={(e) => onWpmChange(Number(e.target.value))}
          className="studio-range"
        />
      </label>

      <div className="grid gap-1.5">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Voortgang</span>
          <span className="font-mono">
            {Math.round(progress * 100)}% · rest {formatDuration(remainingSeconds)}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-teal-400/90 transition-[width] duration-150"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      {tooLong && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100">
          Dit script duurt naar verwachting langer dan 10 minuten. Verkort de
          tekst of verhoog de spreeksnelheid als je een kortere video wilt.
        </p>
      )}
    </div>
  );
}

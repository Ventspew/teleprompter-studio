import {
  LONG_SCRIPT_SECONDS,
  countWords,
  estimateDurationSeconds,
  estimateScrollDurationSeconds,
  formatDuration,
  suggestedScrollSpeed,
} from "@/lib/scriptStats";

type ScriptStatsProps = {
  script: string;
  wpm: number;
  progress: number;
  scrollDistance: number;
  scrollSpeed: number;
  onWpmChange: (wpm: number) => void;
  onMatchScrollSpeed: (speed: number) => void;
};

export function ScriptStats({
  script,
  wpm,
  progress,
  scrollDistance,
  scrollSpeed,
  onWpmChange,
  onMatchScrollSpeed,
}: ScriptStatsProps) {
  const words = countWords(script);
  const speechSeconds = estimateDurationSeconds(script, wpm);
  const scrollSeconds = estimateScrollDurationSeconds(
    scrollDistance,
    scrollSpeed,
  );
  const remainingSpeech = speechSeconds * (1 - progress);
  const remainingScroll = scrollSeconds * (1 - progress);
  const tooLong = speechSeconds > LONG_SCRIPT_SECONDS;
  const matchedSpeed = suggestedScrollSpeed(scrollDistance, speechSeconds);
  const speedMismatch =
    scrollDistance > 0 &&
    speechSeconds > 0 &&
    Math.abs(scrollSeconds - speechSeconds) > Math.max(8, speechSeconds * 0.18);

  return (
    <div className="grid gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Script
          </p>
          <p className="mt-1 text-2xl font-medium text-zinc-100">
            {words} <span className="text-base text-zinc-500">woorden</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Geschatte spreektijd</p>
          <p
            className={`text-lg font-mono ${tooLong ? "text-amber-300" : "text-teal-300"}`}
          >
            {formatDuration(speechSeconds)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-white/8 bg-black/20 px-3 py-2">
          <p className="text-zinc-500">Autocue bij deze snelheid</p>
          <p className="mt-1 font-mono text-zinc-100">
            {formatDuration(scrollSeconds)}
          </p>
        </div>
        <div className="rounded-lg border border-white/8 bg-black/20 px-3 py-2">
          <p className="text-zinc-500">Nog te scrollen</p>
          <p className="mt-1 font-mono text-zinc-100">
            {formatDuration(remainingScroll)}
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
        <span className="text-[11px] text-zinc-600">
          Tip: rustig voorlezen ≈ 120–140 · vlot ≈ 150–165
        </span>
      </label>

      {speedMismatch && (
        <button
          type="button"
          className="studio-btn-ghost justify-center text-xs"
          onClick={() => onMatchScrollSpeed(matchedSpeed)}
        >
          Stem scrollsnelheid af op spreektijd ({matchedSpeed} px/s)
        </button>
      )}

      <div className="grid gap-1.5">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Voortgang</span>
          <span className="font-mono">
            {Math.round(progress * 100)}% · rest spreek{" "}
            {formatDuration(remainingSpeech)}
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

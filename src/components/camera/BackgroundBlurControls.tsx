import { Sparkles } from "lucide-react";

type BackgroundBlurControlsProps = {
  enabled: boolean;
  blurAmount: number;
  loading: boolean;
  disabled?: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onBlurAmountChange: (amount: number) => void;
};

export function BackgroundBlurControls({
  enabled,
  blurAmount,
  loading,
  disabled,
  onEnabledChange,
  onBlurAmountChange,
}: BackgroundBlurControlsProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3">
      <label className="flex items-center gap-2 text-sm text-zinc-200">
        <input
          type="checkbox"
          className="accent-teal-400"
          checked={enabled}
          disabled={disabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
        />
        <Sparkles className="h-4 w-4 text-teal-300" />
        Achtergrond vervagen
        {loading && (
          <span className="text-xs text-zinc-500">model laden…</span>
        )}
      </label>

      <p className="text-xs leading-relaxed text-zinc-500">
        Zoals in Teams: jij blijft scherp, de omgeving wordt lokaal vervaagd.
        Werkt in preview én in de opname. Geen cloud.
      </p>

      <label
        className={`grid gap-1.5 text-xs text-zinc-400 ${enabled ? "" : "opacity-40"}`}
      >
        Sterkte ({blurAmount}px)
        <input
          type="range"
          min={6}
          max={28}
          value={blurAmount}
          disabled={!enabled || disabled}
          onChange={(e) => onBlurAmountChange(Number(e.target.value))}
          className="studio-range"
        />
      </label>
    </div>
  );
}


type MicMeterProps = {
  level: number;
  active: boolean;
};

export function MicMeter({ level, active }: MicMeterProps) {
  const pct = active ? Math.round(level * 100) : 0;

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>Microfoon</span>
        <span className="font-mono text-zinc-500">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-teal-400 transition-[width] duration-75"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

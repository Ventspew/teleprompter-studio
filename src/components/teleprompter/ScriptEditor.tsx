
type ScriptEditorProps = {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

export function ScriptEditor({ value, onChange, compact }: ScriptEditorProps) {
  return (
    <label className="grid gap-1.5 text-xs text-zinc-400">
      Script
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck
        className={`studio-textarea font-[family-name:var(--font-prompter)] ${
          compact ? "min-h-40" : "min-h-56"
        }`}
        placeholder="Plak hier je volledige script…"
      />
    </label>
  );
}

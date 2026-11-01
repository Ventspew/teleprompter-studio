
type ReadingLineProps = {
  className?: string;
};

export function ReadingLine({ className = "" }: ReadingLineProps) {
  return (
    <div
      className={`pointer-events-none absolute left-0 right-0 z-20 flex items-center ${className}`}
      aria-hidden
    >
      <div className="h-px flex-1 bg-teal-400/70" />
      <div className="mx-2 h-3 w-3 rotate-45 border border-teal-300/90 bg-teal-400/30" />
      <div className="h-px flex-1 bg-teal-400/70" />
    </div>
  );
}

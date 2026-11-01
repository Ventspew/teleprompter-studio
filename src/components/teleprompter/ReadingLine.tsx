type ReadingLineProps = {
  className?: string;
  /** Height of the "read this" band in pixels. */
  bandHeight?: number;
};

/**
 * Clear reading band: shows which lines you should be speaking now.
 */
export function ReadingLine({
  className = "",
  bandHeight = 64,
}: ReadingLineProps) {
  const height = Math.max(40, Math.min(120, bandHeight));

  return (
    <div
      className={`pointer-events-none absolute left-0 right-0 z-20 ${className}`}
      style={{ height }}
      aria-hidden
    >
      {/* Dim above */}
      <div className="absolute inset-x-0 bottom-full h-[45vh] bg-gradient-to-b from-black/55 via-black/35 to-transparent" />

      {/* Active reading band */}
      <div className="relative flex h-full items-center">
        <div className="absolute inset-0 border-y border-teal-300/50 bg-teal-400/15 shadow-[0_0_40px_rgba(45,212,191,0.12)]" />
        <div className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-md bg-teal-400/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-teal-100 sm:block">
          Lees hier
        </div>
        <div className="absolute inset-y-0 left-0 w-1 bg-teal-300/80" />
        <div className="absolute inset-y-0 right-0 w-1 bg-teal-300/80" />
      </div>

      {/* Dim below */}
      <div className="absolute inset-x-0 top-full h-[55vh] bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
    </div>
  );
}

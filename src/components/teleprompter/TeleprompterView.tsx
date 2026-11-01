import { useEffect, useRef } from "react";
import { ReadingLine } from "./ReadingLine";
import type { DisplayMode } from "@/lib/types";

type TeleprompterViewProps = {
  script: string;
  offset: number;
  fontSize: number;
  lineHeight: number;
  textWidth: number;
  whiteOnBlack: boolean;
  mirrored: boolean;
  centered: boolean;
  overlayOpacity: number;
  mode: DisplayMode;
  onMetrics: (contentHeight: number, viewportHeight: number) => void;
  onScriptChange?: (value: string) => void;
  editable?: boolean;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

export function TeleprompterView({
  script,
  offset,
  fontSize,
  lineHeight,
  textWidth,
  whiteOnBlack,
  mirrored,
  centered,
  overlayOpacity,
  mode,
  onMetrics,
  onScriptChange,
  editable = true,
}: TeleprompterViewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const focusedRef = useRef(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const report = () => {
      onMetrics(content.scrollHeight, viewport.clientHeight);
    };

    report();
    const observer = new ResizeObserver(report);
    observer.observe(viewport);
    observer.observe(content);
    return () => observer.disconnect();
  }, [onMetrics, script, fontSize, lineHeight, textWidth]);

  useEffect(() => {
    const node = editableRef.current;
    if (!node || focusedRef.current) return;
    node.innerHTML = escapeHtml(script);
  }, [script]);

  const isOverlayBand = mode === "overlay" || mode === "focus";
  const textColor = whiteOnBlack ? "text-white" : "text-zinc-100";
  const bg = mode === "classic" ? "bg-black" : "bg-transparent";

  // Leeslijn dicht bij de webcam (bovenin) in overlay/focus.
  const readingLineTop =
    mode === "classic" ? "top-[28%]" : mode === "focus" ? "top-[22%]" : "top-[24%]";

  const padTop =
    mode === "classic" ? "pt-[28vh]" : mode === "focus" ? "pt-[18%]" : "pt-[20%]";

  return (
    <div
      ref={viewportRef}
      className={`relative h-full w-full overflow-hidden ${bg}`}
      style={{
        opacity: isOverlayBand ? overlayOpacity : 1,
      }}
    >
      <ReadingLine className={readingLineTop} />

      <div
        className={`absolute inset-x-0 ${padTop} will-change-transform ${
          isOverlayBand ? "pb-[30%]" : "pb-[40vh]"
        }`}
        style={{ transform: `translate3d(0, ${-offset}px, 0)` }}
      >
        <div
          ref={contentRef}
          className={`mx-auto px-6 ${textColor} ${
            centered ? "text-center" : "text-left"
          } ${mirrored ? "scale-x-[-1]" : ""}`}
          style={{
            maxWidth: mode === "focus" ? Math.min(textWidth, 520) : textWidth,
            fontSize,
            lineHeight,
            fontFamily: "var(--font-prompter)",
            textShadow: isOverlayBand
              ? "0 1px 2px rgba(0,0,0,0.9), 0 4px 18px rgba(0,0,0,0.65)"
              : undefined,
          }}
        >
          {editable && onScriptChange ? (
            <div
              ref={editableRef}
              contentEditable
              suppressContentEditableWarning
              className="outline-none whitespace-pre-wrap"
              onFocus={() => {
                focusedRef.current = true;
              }}
              onBlur={(e) => {
                focusedRef.current = false;
                onScriptChange(e.currentTarget.innerText);
              }}
            />
          ) : (
            <div className="whitespace-pre-wrap">{script}</div>
          )}
        </div>
      </div>
    </div>
  );
}


import { useEffect } from "react";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest("[contenteditable='true']"));
}

export type ShortcutHandlers = {
  onToggleTeleprompter: () => void;
  onSlower: () => void;
  onFaster: () => void;
  onRewind: () => void;
  onForward: () => void;
  onToggleRecord: () => void;
  onToggleFocus: () => void;
  onExitFocus: () => void;
};

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const key = event.key;

      if (key === " " || key === "Spacebar") {
        event.preventDefault();
        handlers.onToggleTeleprompter();
        return;
      }
      if (key === "ArrowUp") {
        event.preventDefault();
        handlers.onSlower();
        return;
      }
      if (key === "ArrowDown") {
        event.preventDefault();
        handlers.onFaster();
        return;
      }
      if (key === "ArrowLeft") {
        event.preventDefault();
        handlers.onRewind();
        return;
      }
      if (key === "ArrowRight") {
        event.preventDefault();
        handlers.onForward();
        return;
      }
      if (key === "r" || key === "R") {
        event.preventDefault();
        handlers.onToggleRecord();
        return;
      }
      if (key === "f" || key === "F") {
        event.preventDefault();
        handlers.onToggleFocus();
        return;
      }
      if (key === "Escape") {
        event.preventDefault();
        handlers.onExitFocus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, handlers]);
}

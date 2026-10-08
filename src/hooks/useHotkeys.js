import { useEffect, useRef } from "react";

const isTyping = (el) => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);

/**
 * Global keyboard shortcuts. `bindings` maps a key ("n", "?", "mod+k") or a two-key
 * sequence ("g d") to a handler. Single keys are ignored while typing in a field.
 */
export function useHotkeys(bindings) {
  const ref = useRef(bindings);
  ref.current = bindings;

  useEffect(() => {
    let pending = null;
    let timer = null;

    const onKey = (e) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ref.current[`mod+${key}`]) {
        e.preventDefault();
        ref.current[`mod+${key}`](e);
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(document.activeElement)) return;

      if (pending) {
        const handler = ref.current[`${pending} ${key}`];
        pending = null;
        clearTimeout(timer);
        if (handler) {
          e.preventDefault();
          handler(e);
        }
        return;
      }
      if (Object.keys(ref.current).some((k) => k.startsWith(`${key} `))) {
        pending = key;
        timer = setTimeout(() => (pending = null), 1200);
        return;
      }
      const handler = ref.current[e.key] ?? ref.current[key];
      if (handler) {
        e.preventDefault();
        handler(e);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer);
    };
  }, []);
}

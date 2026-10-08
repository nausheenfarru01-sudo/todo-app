import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTasks } from "./TaskContext";

const FocusContext = createContext(null);

// Pomodoro timer that keeps running while you switch views. It tracks an end timestamp,
// so it stays accurate even when the browser throttles background tabs.
export function FocusProvider({ children }) {
  const { state, actions } = useTasks();
  const { focusMinutes, breakMinutes } = state.settings;
  const [mode, setMode] = useState("focus");
  const [endsAt, setEndsAt] = useState(null);
  const [remaining, setRemaining] = useState(focusMinutes * 60);
  const [taskId, setTaskId] = useState(null);
  const [sessions, setSessions] = useState(0);
  const finishing = useRef(false);

  const duration = (mode === "focus" ? focusMinutes : breakMinutes) * 60;
  const running = endsAt !== null;

  useEffect(() => {
    if (!running) setRemaining(duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const finish = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;
    setEndsAt(null);
    if (mode === "focus") {
      actions.logFocus(focusMinutes, taskId);
      setSessions((n) => n + 1);
      actions.toast(`Focus session done: ${focusMinutes} minutes logged. Take a break!`);
      setMode("break");
      setRemaining(breakMinutes * 60);
    } else {
      actions.toast("Break over. Ready for another round?");
      setMode("focus");
      setRemaining(focusMinutes * 60);
    }
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain).connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio not available; the toast is enough.
    }
    setTimeout(() => (finishing.current = false), 0);
  }, [mode, focusMinutes, breakMinutes, taskId, actions]);

  useEffect(() => {
    if (!running) return undefined;
    const tick = () => {
      const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) finish();
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [running, endsAt, finish]);

  useEffect(() => {
    const base = "TaskFlow";
    if (!running) {
      document.title = base;
      return;
    }
    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    document.title = `${m}:${s} · ${mode === "focus" ? "Focus" : "Break"} — ${base}`;
  }, [remaining, running, mode]);

  const value = {
    mode,
    running,
    remaining,
    duration,
    taskId,
    sessions,
    setTaskId,
    start: () => setEndsAt(Date.now() + remaining * 1000),
    pause: () => setEndsAt(null),
    reset: () => {
      setEndsAt(null);
      setRemaining(duration);
    },
    switchMode: (next) => {
      setEndsAt(null);
      setMode(next);
      setRemaining((next === "focus" ? focusMinutes : breakMinutes) * 60);
    },
    skip: finish,
  };

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook lives beside its provider
export const useFocus = () => useContext(FocusContext);

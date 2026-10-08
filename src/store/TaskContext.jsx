import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { todayISO } from "../lib/date";
import { parseQuickAdd } from "../lib/parse";
import { PROJECT_COLORS, createTask, emptyState, reducer, uid } from "./reducer";
import { sampleState } from "./seed";

const STORAGE_KEY = "taskflow.v1";
const TaskContext = createContext(null);

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return reducer(emptyState(), { type: "LOAD", state: JSON.parse(raw) });
  } catch {
    // Corrupt or blocked storage: fall through to sample data.
  }
  return sampleState();
}

// Routes live in the URL hash (#/today, #/project/<id>) so views survive reloads and can be bookmarked.
function parseHash(hash) {
  const [name = "dashboard", id] = hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
  return { name: name || "dashboard", id };
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const [toasts, setToasts] = useState([]);
  const [ui, setUI] = useState({ selectedId: null, palette: false, quickAdd: null, settings: false, help: false, sidebar: false });
  const [search, setSearch] = useState("");
  const [today, setToday] = useState(todayISO);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or disabled; the app keeps working in memory.
    }
  }, [state]);

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash(window.location.hash));
      setUI((u) => ({ ...u, selectedId: null, sidebar: false }));
    };
    window.addEventListener("hashchange", onHash);
    // Roll "today" over at midnight for tabs left open.
    const timer = setInterval(() => setToday(todayISO()), 60_000);
    return () => {
      window.removeEventListener("hashchange", onHash);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const { theme, accent } = state.settings;
    const root = document.documentElement;
    const dark = theme === "dark" || (theme === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = dark ? "dark" : "light";
    root.style.setProperty("--accent", accent);
  }, [state.settings]);

  const navigate = useCallback((name, id) => {
    window.location.hash = id ? `/${name}/${encodeURIComponent(id)}` : `/${name}`;
    setUI((u) => ({ ...u, sidebar: false }));
  }, []);

  const dismissToast = useCallback((id) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (message, undo) => {
      const id = uid();
      setToasts((all) => [...all.slice(-2), { id, message, undo }]);
      setTimeout(() => dismissToast(id), 5000);
    },
    [dismissToast],
  );

  const ensureProject = useCallback((name) => {
    if (!name) return null;
    const existing = stateRef.current.projects.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;
    const project = { id: uid(), name: name.replace(/\b\w/g, (c) => c.toUpperCase()), color: PROJECT_COLORS[stateRef.current.projects.length % PROJECT_COLORS.length] };
    dispatch({ type: "ADD_PROJECT", project });
    return project.id;
  }, []);

  const actions = useMemo(
    () => ({
      addFromText(text, defaults = {}) {
        const parsed = parseQuickAdd(text, todayISO());
        if (!parsed.title) return null;
        const task = createTask({
          title: parsed.title,
          priority: parsed.priority !== "none" ? parsed.priority : defaults.priority ?? "none",
          due: parsed.due ?? defaults.due ?? null,
          tags: [...new Set([...(defaults.tags ?? []), ...parsed.tags])],
          projectId: parsed.projectName ? ensureProject(parsed.projectName) : defaults.projectId ?? null,
          status: defaults.status ?? "todo",
        });
        dispatch({ type: "ADD_TASK", task });
        return task;
      },
      update: (id, patch) => dispatch({ type: "UPDATE_TASK", id, patch }),
      setStatus: (id, status) => dispatch({ type: "SET_STATUS", id, status }),
      toggle(id) {
        const before = stateRef.current.tasks.find((t) => t.id === id);
        dispatch({ type: "TOGGLE_TASK", id });
        if (before && before.status !== "done") {
          toast(`Completed “${before.title}”`, () => dispatch({ type: "REPLACE_TASK", task: before }));
        }
      },
      remove(id) {
        const index = stateRef.current.tasks.findIndex((t) => t.id === id);
        const task = stateRef.current.tasks[index];
        if (!task) return;
        dispatch({ type: "DELETE_TASK", id });
        setUI((u) => (u.selectedId === id ? { ...u, selectedId: null } : u));
        toast(`Deleted “${task.title}”`, () => dispatch({ type: "RESTORE_TASK", task, index }));
      },
      clearCompleted() {
        const previous = stateRef.current;
        const count = previous.tasks.filter((t) => t.status === "done").length;
        if (!count) return;
        dispatch({ type: "CLEAR_COMPLETED" });
        toast(`Cleared ${count} completed task${count === 1 ? "" : "s"}`, () => dispatch({ type: "LOAD", state: previous }));
      },
      addSubtask: (id, title) => dispatch({ type: "ADD_SUBTASK", id, title }),
      toggleSubtask: (id, subtaskId) => dispatch({ type: "TOGGLE_SUBTASK", id, subtaskId }),
      deleteSubtask: (id, subtaskId) => dispatch({ type: "DELETE_SUBTASK", id, subtaskId }),
      addProject(name) {
        const id = ensureProject(name.trim());
        if (id) navigate("project", id);
      },
      updateProject: (id, patch) => dispatch({ type: "UPDATE_PROJECT", id, patch }),
      deleteProject(id) {
        const previous = stateRef.current;
        const project = previous.projects.find((p) => p.id === id);
        dispatch({ type: "DELETE_PROJECT", id });
        navigate("inbox");
        toast(`Deleted project “${project?.name}”`, () => dispatch({ type: "LOAD", state: previous }));
      },
      logFocus: (minutes, taskId) => dispatch({ type: "LOG_FOCUS", minutes, taskId }),
      setSettings: (patch) => dispatch({ type: "SET_SETTINGS", patch }),
      load: (data) => dispatch({ type: "LOAD", state: data }),
      loadSample: () => dispatch({ type: "LOAD", state: sampleState() }),
      reset: () => dispatch({ type: "LOAD", state: { ...emptyState(), settings: stateRef.current.settings } }),
      toast,
    }),
    [ensureProject, navigate, toast],
  );

  const value = { state, actions, route, navigate, today, toasts, dismissToast, ui, setUI, search, setSearch };
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook lives beside its provider
export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used inside <TaskProvider>");
  return ctx;
}

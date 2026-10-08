import { toISO } from "../lib/date";

export const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const PROJECT_COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#06b6d4", "#8b5cf6", "#ef4444", "#84cc16"];

export const DEFAULT_SETTINGS = { name: "Fareeha", theme: "dark", accent: "#7c5cff", focusMinutes: 25, breakMinutes: 5 };

export const emptyState = () => ({ tasks: [], projects: [], focusLog: [], settings: { ...DEFAULT_SETTINGS } });

export function createTask(fields) {
  return {
    id: uid(),
    title: "",
    notes: "",
    status: "todo",
    priority: "none",
    due: null,
    projectId: null,
    tags: [],
    subtasks: [],
    createdAt: Date.now(),
    completedAt: null,
    ...fields,
  };
}

const mapTask = (state, id, fn) => ({ ...state, tasks: state.tasks.map((t) => (t.id === id ? fn(t) : t)) });

function withStatus(task, status) {
  if (task.status === status) return task;
  return { ...task, status, completedAt: status === "done" ? Date.now() : null };
}

export function reducer(state, action) {
  switch (action.type) {
    case "ADD_TASK":
      return { ...state, tasks: [action.task, ...state.tasks] };

    case "UPDATE_TASK":
      return mapTask(state, action.id, (t) => {
        const next = { ...t, ...action.patch };
        return action.patch.status ? withStatus({ ...next, status: t.status }, action.patch.status) : next;
      });

    case "TOGGLE_TASK":
      return mapTask(state, action.id, (t) => withStatus(t, t.status === "done" ? "todo" : "done"));

    case "SET_STATUS":
      return mapTask(state, action.id, (t) => withStatus(t, action.status));

    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };

    case "RESTORE_TASK": {
      const tasks = [...state.tasks];
      tasks.splice(Math.min(action.index, tasks.length), 0, action.task);
      return { ...state, tasks };
    }

    case "REPLACE_TASK":
      return mapTask(state, action.task.id, () => action.task);

    case "CLEAR_COMPLETED":
      return { ...state, tasks: state.tasks.filter((t) => t.status !== "done") };

    case "ADD_SUBTASK":
      return mapTask(state, action.id, (t) => ({
        ...t,
        subtasks: [...t.subtasks, { id: uid(), title: action.title, done: false }],
      }));

    case "TOGGLE_SUBTASK":
      return mapTask(state, action.id, (t) => ({
        ...t,
        subtasks: t.subtasks.map((s) => (s.id === action.subtaskId ? { ...s, done: !s.done } : s)),
      }));

    case "DELETE_SUBTASK":
      return mapTask(state, action.id, (t) => ({ ...t, subtasks: t.subtasks.filter((s) => s.id !== action.subtaskId) }));

    case "ADD_PROJECT":
      return { ...state, projects: [...state.projects, action.project] };

    case "UPDATE_PROJECT":
      return { ...state, projects: state.projects.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)) };

    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.id),
        tasks: state.tasks.map((t) => (t.projectId === action.id ? { ...t, projectId: null } : t)),
      };

    case "LOG_FOCUS":
      return {
        ...state,
        focusLog: [...state.focusLog, { date: toISO(new Date()), minutes: action.minutes, taskId: action.taskId ?? null }],
      };

    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case "LOAD":
      return { ...emptyState(), ...action.state, settings: { ...DEFAULT_SETTINGS, ...action.state.settings } };

    default:
      return state;
  }
}

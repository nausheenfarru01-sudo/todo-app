import { addDays, diffDays, toISO } from "./date";

export const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };

export const PRIORITY_META = {
  urgent: { label: "Urgent", color: "#ef4444" },
  high: { label: "High", color: "#f97316" },
  medium: { label: "Medium", color: "#eab308" },
  low: { label: "Low", color: "#3b82f6" },
  none: { label: "No priority", color: "#64748b" },
};

export const STATUS_META = {
  todo: { label: "To do" },
  doing: { label: "In progress" },
  done: { label: "Done" },
};

export const isDone = (t) => t.status === "done";
export const isOverdue = (t, today) => !isDone(t) && t.due && t.due < today;

export const SORTERS = {
  smart: (a, b) =>
    (a.due ?? "9999") .localeCompare(b.due ?? "9999") ||
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
    b.createdAt - a.createdAt,
  priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || (a.due ?? "9999").localeCompare(b.due ?? "9999"),
  due: (a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"),
  created: (a, b) => b.createdAt - a.createdAt,
  alpha: (a, b) => a.title.localeCompare(b.title),
};

export function matchesSearch(task, query, projects) {
  if (!query) return true;
  const q = query.toLowerCase();
  const project = projects.find((p) => p.id === task.projectId);
  return (
    task.title.toLowerCase().includes(q) ||
    task.notes.toLowerCase().includes(q) ||
    task.tags.some((tag) => tag.includes(q.replace(/^#/, ""))) ||
    (project && project.name.toLowerCase().includes(q))
  );
}

// Which tasks belong to each sidebar view.
export function tasksForView(tasks, view, today) {
  switch (view.name) {
    case "today":
      return tasks.filter((t) => !isDone(t) && t.due && t.due <= today);
    case "upcoming":
      return tasks.filter((t) => !isDone(t) && t.due && t.due > today);
    case "inbox":
      return tasks.filter((t) => !isDone(t));
    case "completed":
      return tasks.filter(isDone);
    case "project":
      return tasks.filter((t) => t.projectId === view.id);
    case "tag":
      return tasks.filter((t) => t.tags.includes(view.id));
    default:
      return tasks;
  }
}

export function groupByDue(tasks, today) {
  const groups = new Map();
  const add = (key, label, task) => {
    if (!groups.has(key)) groups.set(key, { key, label, tasks: [] });
    groups.get(key).tasks.push(task);
  };
  for (const t of tasks) {
    if (isDone(t)) add("done", "Completed", t);
    else if (!t.due) add("someday", "No date", t);
    else if (t.due < today) add("overdue", "Overdue", t);
    else if (t.due === today) add("today", "Today", t);
    else if (t.due === addDays(today, 1)) add("tomorrow", "Tomorrow", t);
    else if (diffDays(t.due, today) < 7) add("week", "This week", t);
    else add("later", "Later", t);
  }
  const order = ["overdue", "today", "tomorrow", "week", "later", "someday", "done"];
  return order.filter((k) => groups.has(k)).map((k) => groups.get(k));
}

const dayOf = (ms) => toISO(new Date(ms));

export function computeStats(state, today) {
  const { tasks, focusLog } = state;
  const open = tasks.filter((t) => !isDone(t));
  const done = tasks.filter(isDone);

  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const completedByDay = Object.fromEntries(last7.map((d) => [d, 0]));
  for (const t of done) {
    const d = dayOf(t.completedAt);
    if (d in completedByDay) completedByDay[d] += 1;
  }

  const completionDays = new Set(done.map((t) => dayOf(t.completedAt)));
  let streak = 0;
  let cursor = completionDays.has(today) ? today : addDays(today, -1);
  while (completionDays.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  const byPriority = Object.fromEntries(Object.keys(PRIORITY_META).map((p) => [p, 0]));
  for (const t of open) byPriority[t.priority] += 1;

  const focusToday = focusLog.filter((f) => f.date === today).reduce((sum, f) => sum + f.minutes, 0);
  const focusWeek = focusLog.filter((f) => last7.includes(f.date)).reduce((sum, f) => sum + f.minutes, 0);

  return {
    total: tasks.length,
    open: open.length,
    done: done.length,
    dueToday: open.filter((t) => t.due === today).length,
    overdue: open.filter((t) => isOverdue(t, today)).length,
    inProgress: open.filter((t) => t.status === "doing").length,
    doneToday: completedByDay[today],
    doneThisWeek: Object.values(completedByDay).reduce((a, b) => a + b, 0),
    completionRate: tasks.length ? Math.round((done.length / tasks.length) * 100) : 0,
    week: last7.map((d) => ({ date: d, count: completedByDay[d] })),
    byPriority,
    streak,
    focusToday,
    focusWeek,
  };
}

export function allTags(tasks) {
  const counts = new Map();
  for (const t of tasks) if (!isDone(t)) for (const tag of t.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  for (const t of tasks) for (const tag of t.tags) if (!counts.has(tag)) counts.set(tag, 0);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

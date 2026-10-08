// Dates are stored as local "YYYY-MM-DD" strings so a task due "today" stays today in every time zone.

const pad = (n) => String(n).padStart(2, "0");

export function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const todayISO = () => toISO(new Date());

export function addDays(iso, days) {
  const date = fromISO(iso);
  date.setDate(date.getDate() + days);
  return toISO(date);
}

export function diffDays(a, b) {
  return Math.round((fromISO(a) - fromISO(b)) / 86_400_000);
}

export function formatDue(iso, today = todayISO()) {
  const diff = diffDays(iso, today);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  const date = fromISO(iso);
  if (diff > 1 && diff < 7) return date.toLocaleDateString(undefined, { weekday: "long" });
  const sameYear = date.getFullYear() === fromISO(today).getFullYear();
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
}

export function dueTone(iso, today = todayISO()) {
  if (!iso) return "";
  const diff = diffDays(iso, today);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 2) return "soon";
  return "";
}

export function greeting(hour = new Date().getHours()) {
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
export const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export const formatClock = (sec) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

import { MONTHS, WEEKDAYS, addDays, fromISO, toISO } from "./date";

export const PRIORITIES = ["urgent", "high", "medium", "low", "none"];

const PRIORITY_ALIASES = {
  urgent: "urgent", u: "urgent", p1: "urgent", 1: "urgent",
  high: "high", h: "high", p2: "high", 2: "high",
  medium: "medium", med: "medium", m: "medium", p3: "medium", 3: "medium",
  low: "low", l: "low", p4: "low", 4: "low",
};

// Each rule matches a date phrase and returns its ISO date. Order matters: longer phrases first.
const DATE_RULES = [
  [/\b(?:today|tod)\b/i, (_, today) => today],
  [/\b(?:tomorrow|tmrw?|tmr)\b/i, (_, today) => addDays(today, 1)],
  [/\bnext week\b/i, (_, today) => addDays(today, 7)],
  [/\bin (\d{1,3}) (day|days|week|weeks)\b/i, (m, today) => addDays(today, Number(m[1]) * (m[2].startsWith("week") ? 7 : 1))],
  [/\b(\d{4}-\d{2}-\d{2})\b/, (m) => m[1]],
  [
    new RegExp(`\\b(\\d{1,2}) (${MONTHS.join("|")})[a-z]*\\b|\\b(${MONTHS.join("|")})[a-z]* (\\d{1,2})\\b`, "i"),
    (m, today) => {
      const day = Number(m[1] ?? m[4]);
      const month = MONTHS.indexOf((m[2] ?? m[3]).toLowerCase().slice(0, 3));
      const base = fromISO(today);
      let date = new Date(base.getFullYear(), month, day);
      if (toISO(date) < today) date = new Date(base.getFullYear() + 1, month, day);
      return toISO(date);
    },
  ],
  [
    new RegExp(`\\b(?:on |next )?(${WEEKDAYS.map((d) => `${d.slice(0, 3)}(?:${d.slice(3)})?`).join("|")})\\b`, "i"),
    (m, today) => {
      const target = WEEKDAYS.findIndex((d) => d.startsWith(m[1].toLowerCase().slice(0, 3)));
      const current = fromISO(today).getDay();
      return addDays(today, ((target - current + 7) % 7) || 7);
    },
  ],
];

/**
 * Parse quick-add text like "Submit lab tomorrow !high #java @College".
 * Returns the cleaned title plus any priority, due date, tags and project name found.
 */
export function parseQuickAdd(input, today) {
  let text = ` ${input} `;
  const result = { title: "", priority: "none", due: null, tags: [], projectName: null };

  text = text.replace(/\s!(\w+)/g, (match, word) => {
    const priority = PRIORITY_ALIASES[word.toLowerCase()];
    if (!priority) return match;
    result.priority = priority;
    return " ";
  });

  text = text.replace(/\s#([\p{L}\p{N}_-]+)/gu, (_, tag) => {
    const clean = tag.toLowerCase();
    if (!result.tags.includes(clean)) result.tags.push(clean);
    return " ";
  });

  text = text.replace(/\s@([\p{L}\p{N}_-]+)/u, (_, project) => {
    result.projectName = project.replace(/[-_]/g, " ");
    return " ";
  });

  for (const [pattern, toDate] of DATE_RULES) {
    const match = text.match(pattern);
    if (match) {
      result.due = toDate(match, today);
      text = text.replace(match[0], " ");
      text = text.replace(/\s(?:by|due|on)\s*$/i, " ");
      break;
    }
  }

  result.title = text.replace(/\s+/g, " ").trim();
  return result;
}

import { addDays, todayISO } from "../lib/date";
import { DEFAULT_SETTINGS, createTask, uid } from "./reducer";

// Sample data so a first-time visitor sees a living dashboard. Dates are relative to today.
export function sampleState(today = todayISO()) {
  const p = (name, color) => ({ id: uid(), name, color });
  const college = p("College", "#6366f1");
  const career = p("Internship Prep", "#10b981");
  const personal = p("Personal", "#ec4899");
  const side = p("Side Projects", "#f59e0b");

  const daysAgo = (n, hour = 18) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(hour, 0, 0, 0);
    return d.getTime();
  };
  const sub = (title, done = false) => ({ id: uid(), title, done });
  const done = (n, fields) => createTask({ status: "done", completedAt: daysAgo(n), createdAt: daysAgo(n + 2), ...fields });

  const tasks = [
    createTask({ title: "Submit Java lab record", priority: "high", due: today, projectId: college.id, tags: ["java"], status: "doing",
      notes: "Programs 1–12: inheritance, interfaces, exception handling, multithreading.",
      subtasks: [sub("Write remaining 2 programs", true), sub("Print output screenshots"), sub("Get it signed by lab in-charge")] }),
    createTask({ title: "Solve 2 LeetCode problems (arrays)", priority: "medium", due: today, projectId: career.id, tags: ["dsa"],
      subtasks: [sub("Two Sum", true), sub("Best Time to Buy and Sell Stock")] }),
    createTask({ title: "Return library books", priority: "low", due: addDays(today, -1), projectId: personal.id }),
    createTask({ title: "Apply to 3 internships on Internshala", priority: "urgent", due: addDays(today, 1), projectId: career.id, tags: ["jobs"] }),
    createTask({ title: "Revise DBMS normalization (1NF–BCNF)", priority: "high", due: addDays(today, 2), projectId: college.id, tags: ["exam"] }),
    createTask({ title: "Add persistent FAISS index to RAG chatbot", priority: "medium", due: addDays(today, 4), projectId: side.id, tags: ["python", "ai"], status: "doing" }),
    createTask({ title: "Prepare seminar slides on Transformers", priority: "high", due: addDays(today, 6), projectId: college.id, tags: ["ai"],
      subtasks: [sub("Outline"), sub("Diagrams"), sub("Practice run")] }),
    createTask({ title: "Update LinkedIn with new projects", priority: "medium", due: addDays(today, 9), projectId: career.id }),
    createTask({ title: "Plan weekend with family", priority: "none", projectId: personal.id }),
    createTask({ title: "Learn React Router basics", priority: "low", projectId: side.id, tags: ["react"] }),
    done(0, { title: "Morning walk", projectId: personal.id }),
    done(0, { title: "Fix bug in to-do app filters", projectId: side.id, tags: ["react"] }),
    done(1, { title: "Read OS chapter on deadlocks", projectId: college.id, tags: ["exam"] }),
    done(1, { title: "Push RAG chatbot README update", projectId: side.id, tags: ["ai"] }),
    done(1, { title: "Mock interview with friend", projectId: career.id }),
    done(2, { title: "Complete DAA assignment 3", projectId: college.id }),
    done(3, { title: "Solve 3 string problems", projectId: career.id, tags: ["dsa"] }),
    done(3, { title: "Buy stationery", projectId: personal.id }),
    done(4, { title: "Watch CN lecture on TCP", projectId: college.id }),
    done(5, { title: "Resume review", projectId: career.id }),
    done(5, { title: "Set up GitHub profile README", projectId: side.id }),
    done(6, { title: "Clean up desk", projectId: personal.id }),
  ];

  const focusLog = [
    { date: today, minutes: 50, taskId: tasks[0].id },
    { date: addDays(today, -1), minutes: 75, taskId: null },
    { date: addDays(today, -2), minutes: 25, taskId: null },
    { date: addDays(today, -4), minutes: 50, taskId: null },
  ];

  return { tasks, projects: [college, career, personal, side], focusLog, settings: { ...DEFAULT_SETTINGS }, sample: true };
}

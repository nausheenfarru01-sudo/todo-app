import { describe, expect, it } from "vitest";
import { createTask, emptyState, reducer } from "../store/reducer";
import { computeStats, groupByDue, tasksForView } from "../lib/selectors";
import { sampleState } from "../store/seed";

const TODAY = "2026-10-08";
const withTasks = (...tasks) => ({ ...emptyState(), tasks });

describe("reducer", () => {
  it("adds tasks to the top", () => {
    const a = createTask({ title: "A" });
    const b = createTask({ title: "B" });
    const state = reducer(reducer(emptyState(), { type: "ADD_TASK", task: a }), { type: "ADD_TASK", task: b });
    expect(state.tasks.map((t) => t.title)).toEqual(["B", "A"]);
  });

  it("toggles completion and records when it happened", () => {
    const task = createTask({ title: "A" });
    let state = reducer(withTasks(task), { type: "TOGGLE_TASK", id: task.id });
    expect(state.tasks[0].status).toBe("done");
    expect(state.tasks[0].completedAt).toBeTypeOf("number");
    state = reducer(state, { type: "TOGGLE_TASK", id: task.id });
    expect(state.tasks[0]).toMatchObject({ status: "todo", completedAt: null });
  });

  it("moves between board columns", () => {
    const task = createTask({ title: "A" });
    const state = reducer(withTasks(task), { type: "SET_STATUS", id: task.id, status: "doing" });
    expect(state.tasks[0]).toMatchObject({ status: "doing", completedAt: null });
  });

  it("restores a deleted task at its old position", () => {
    const tasks = ["A", "B", "C"].map((title) => createTask({ title }));
    let state = reducer(withTasks(...tasks), { type: "DELETE_TASK", id: tasks[1].id });
    state = reducer(state, { type: "RESTORE_TASK", task: tasks[1], index: 1 });
    expect(state.tasks.map((t) => t.title)).toEqual(["A", "B", "C"]);
  });

  it("manages subtasks", () => {
    const task = createTask({ title: "A" });
    let state = reducer(withTasks(task), { type: "ADD_SUBTASK", id: task.id, title: "step" });
    const sub = state.tasks[0].subtasks[0];
    state = reducer(state, { type: "TOGGLE_SUBTASK", id: task.id, subtaskId: sub.id });
    expect(state.tasks[0].subtasks[0].done).toBe(true);
    state = reducer(state, { type: "DELETE_SUBTASK", id: task.id, subtaskId: sub.id });
    expect(state.tasks[0].subtasks).toEqual([]);
  });

  it("unassigns tasks when their project is deleted", () => {
    const project = { id: "p1", name: "College", color: "#000" };
    const task = createTask({ title: "A", projectId: "p1" });
    const state = reducer({ ...withTasks(task), projects: [project] }, { type: "DELETE_PROJECT", id: "p1" });
    expect(state.projects).toEqual([]);
    expect(state.tasks[0].projectId).toBe(null);
  });

  it("fills in missing settings when loading old data", () => {
    const state = reducer(emptyState(), { type: "LOAD", state: { tasks: [], settings: { name: "X" } } });
    expect(state.settings).toMatchObject({ name: "X", focusMinutes: 25 });
    expect(state.projects).toEqual([]);
  });
});

describe("selectors", () => {
  const tasks = [
    createTask({ title: "overdue", due: "2026-10-06" }),
    createTask({ title: "today", due: TODAY }),
    createTask({ title: "tomorrow", due: "2026-10-09" }),
    createTask({ title: "later", due: "2026-11-01" }),
    createTask({ title: "someday" }),
    createTask({ title: "done", status: "done", completedAt: new Date(2026, 9, 8, 12).getTime() }),
  ];

  it("selects tasks for each view", () => {
    const titles = (name) => tasksForView(tasks, { name }, TODAY).map((t) => t.title);
    expect(titles("today")).toEqual(["overdue", "today"]);
    expect(titles("upcoming")).toEqual(["tomorrow", "later"]);
    expect(titles("inbox")).toHaveLength(5);
    expect(titles("completed")).toEqual(["done"]);
  });

  it("groups by due date in a sensible order", () => {
    expect(groupByDue(tasks, TODAY).map((g) => g.key)).toEqual(["overdue", "today", "tomorrow", "later", "someday", "done"]);
  });

  it("computes dashboard stats", () => {
    const stats = computeStats(withTasks(...tasks), TODAY);
    expect(stats).toMatchObject({ open: 5, done: 1, dueToday: 1, overdue: 1, doneToday: 1, streak: 1 });
    expect(stats.week).toHaveLength(7);
    expect(stats.week.at(-1)).toEqual({ date: TODAY, count: 1 });
  });

  it("sample data is internally consistent", () => {
    const sample = sampleState(TODAY);
    const projectIds = new Set(sample.projects.map((p) => p.id));
    expect(sample.tasks.every((t) => t.projectId === null || projectIds.has(t.projectId))).toBe(true);
    expect(computeStats(sample, TODAY).streak).toBeGreaterThan(0);
  });
});

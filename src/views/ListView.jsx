import { useMemo, useState } from "react";
import { useTasks } from "../store/TaskContext";
import { PRIORITY_META, SORTERS, groupByDue, matchesSearch, tasksForView } from "../lib/selectors";
import Icon from "../components/Icon";
import QuickAdd from "../components/QuickAdd";
import TaskItem from "../components/TaskItem";

const EMPTY = {
  today: { icon: "sun", title: "Your day is clear", text: "Add something for today, or enjoy the free time." },
  upcoming: { icon: "upcoming", title: "Nothing scheduled ahead", text: "Give tasks a due date to see them here." },
  inbox: { icon: "inbox", title: "Inbox zero!", text: "Every task is done. Time for something new?" },
  completed: { icon: "checkCircle", title: "No completed tasks yet", text: "Tick off a task and it will land here." },
  search: { icon: "search", title: "No matches", text: "Try a different word, #tag or project name." },
  project: { icon: "folder", title: "This project is empty", text: "Add the first task below." },
  tag: { icon: "tag", title: "No tasks with this tag", text: "Add one below." },
};

export default function ListView() {
  const { state, actions, route, today, search } = useTasks();
  const [sort, setSort] = useState("smart");
  const [priority, setPriority] = useState("all");
  const [showDone, setShowDone] = useState(false);

  const project = route.name === "project" ? state.projects.find((p) => p.id === route.id) : null;
  const scoped = route.name === "project" || route.name === "tag" || route.name === "search";

  const tasks = useMemo(() => {
    let list = route.name === "search" ? state.tasks.filter((t) => matchesSearch(t, search, state.projects)) : tasksForView(state.tasks, route, today);
    if (scoped && !showDone) list = list.filter((t) => t.status !== "done");
    if (priority !== "all") list = list.filter((t) => t.priority === priority);
    return [...list].sort(route.name === "completed" ? (a, b) => b.completedAt - a.completedAt : SORTERS[sort]);
  }, [state.tasks, state.projects, route, today, search, sort, priority, showDone, scoped]);

  const grouped = route.name === "completed" || sort !== "smart" ? [{ key: "all", label: null, tasks }] : groupByDue(tasks, today);
  const hiddenDone = scoped && !showDone ? tasksForView(state.tasks, route, today).filter((t) => t.status === "done").length : 0;

  const defaults = {
    today: { due: today },
    project: { projectId: route.id },
    tag: { tags: [route.id] },
  }[route.name] ?? {};

  const empty = EMPTY[route.name] ?? EMPTY.inbox;

  return (
    <div className="list-view">
      {project && (
        <div className="project-banner" style={{ "--c": project.color }}>
          <input
            className="project-name-input"
            value={project.name}
            onChange={(e) => actions.updateProject(project.id, { name: e.target.value })}
            aria-label="Project name"
          />
          <div className="spacer" />
          <input type="color" value={project.color} onChange={(e) => actions.updateProject(project.id, { color: e.target.value })} aria-label="Project colour" />
          <button className="btn ghost sm danger" onClick={() => actions.deleteProject(project.id)}>
            <Icon name="trash" size={15} /> Delete project
          </button>
        </div>
      )}

      {route.name !== "completed" && route.name !== "search" && <QuickAdd defaults={defaults} />}

      <div className="toolbar">
        <div className="chip-group" role="group" aria-label="Filter by priority">
          <button className={priority === "all" ? "active" : ""} onClick={() => setPriority("all")}>All</button>
          {Object.entries(PRIORITY_META).filter(([p]) => p !== "none").map(([p, meta]) => (
            <button key={p} className={priority === p ? "active" : ""} onClick={() => setPriority(priority === p ? "all" : p)}>
              <span className="dot" style={{ background: meta.color }} /> {meta.label}
            </button>
          ))}
        </div>
        <div className="spacer" />
        {scoped && (
          <label className="toggle">
            <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> Show completed
          </label>
        )}
        {route.name === "completed" ? (
          <button className="btn ghost sm" onClick={actions.clearCompleted} disabled={!tasks.length}>
            <Icon name="trash" size={15} /> Clear all
          </button>
        ) : (
          <label className="select">
            <Icon name="sort" size={15} />
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort tasks">
              <option value="smart">Smart (by date)</option>
              <option value="priority">Priority</option>
              <option value="due">Due date</option>
              <option value="created">Newest</option>
              <option value="alpha">A → Z</option>
            </select>
          </label>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Icon name={empty.icon} size={30} /></div>
          <h3>{empty.title}</h3>
          <p>{empty.text}</p>
        </div>
      ) : (
        grouped.map((g) => (
          <section key={g.key} className={`task-group ${g.key}`}>
            {g.label && (
              <h4>
                {g.label} <span>{g.tasks.length}</span>
              </h4>
            )}
            <div className="task-list" role="list">
              {g.tasks.map((t) => <TaskItem key={t.id} task={t} />)}
            </div>
          </section>
        ))
      )}

      {hiddenDone > 0 && (
        <button className="link muted show-done" onClick={() => setShowDone(true)}>
          + {hiddenDone} completed task{hiddenDone === 1 ? "" : "s"} hidden
        </button>
      )}
    </div>
  );
}

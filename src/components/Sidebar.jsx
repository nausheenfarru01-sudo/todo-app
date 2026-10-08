import { useState } from "react";
import { useTasks } from "../store/TaskContext";
import { allTags, tasksForView } from "../lib/selectors";
import { useFocus } from "../store/FocusContext";
import { formatClock } from "../lib/date";
import Icon from "./Icon";

const NAV = [
  { name: "dashboard", label: "Dashboard", icon: "dashboard" },
  { name: "today", label: "Today", icon: "sun" },
  { name: "upcoming", label: "Upcoming", icon: "upcoming" },
  { name: "inbox", label: "Inbox", icon: "inbox" },
  { name: "board", label: "Board", icon: "board" },
  { name: "calendar", label: "Calendar", icon: "calendar" },
  { name: "focus", label: "Focus", icon: "focus" },
  { name: "completed", label: "Completed", icon: "checkCircle" },
];

const COUNTED = new Set(["today", "upcoming", "inbox"]);

export default function Sidebar() {
  const { state, actions, route, navigate, today, ui, setUI } = useTasks();
  const focus = useFocus();
  const [newProject, setNewProject] = useState(null);
  const tags = allTags(state.tasks).slice(0, 12);
  const overdue = state.tasks.filter((t) => t.status !== "done" && t.due && t.due < today).length;

  const isActive = (name, id) => route.name === name && (id === undefined || route.id === id);

  return (
    <>
      {ui.sidebar && <div className="sidebar-backdrop" onClick={() => setUI((u) => ({ ...u, sidebar: false }))} />}
      <aside className={`sidebar${ui.sidebar ? " open" : ""}`} aria-label="Main navigation">
        <div className="brand">
          <div className="brand-mark"><Icon name="check" size={18} strokeWidth={3} /></div>
          <span>TaskFlow</span>
        </div>

        <button className="btn primary block" onClick={() => setUI((u) => ({ ...u, quickAdd: {} }))}>
          <Icon name="plus" size={17} /> New task <kbd>N</kbd>
        </button>

        <nav className="nav">
          {NAV.map((item) => {
            const count = COUNTED.has(item.name) ? tasksForView(state.tasks, item, today).length : 0;
            return (
              <button key={item.name} className={`nav-item${isActive(item.name) ? " active" : ""}`} onClick={() => navigate(item.name)}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.name === "today" && overdue > 0 && <span className="badge danger" title={`${overdue} overdue`}>{overdue}</span>}
                {count > 0 && <span className="count">{count}</span>}
              </button>
            );
          })}
        </nav>

        <div className="nav-section">
          <div className="nav-heading">
            <span>Projects</span>
            <button className="icon-btn xs" aria-label="Add project" onClick={() => setNewProject("")}>
              <Icon name="plus" size={15} />
            </button>
          </div>
          {state.projects.map((p) => {
            const tasks = state.tasks.filter((t) => t.projectId === p.id);
            const done = tasks.filter((t) => t.status === "done").length;
            return (
              <button key={p.id} className={`nav-item project${isActive("project", p.id) ? " active" : ""}`} onClick={() => navigate("project", p.id)}>
                <span className="project-ring" style={{ "--c": p.color, "--p": tasks.length ? done / tasks.length : 0 }} />
                <span>{p.name}</span>
                <span className="count">{tasks.length - done || ""}</span>
              </button>
            );
          })}
          {newProject !== null && (
            <form
              className="new-project"
              onSubmit={(e) => {
                e.preventDefault();
                if (newProject.trim()) actions.addProject(newProject);
                setNewProject(null);
              }}
            >
              <input autoFocus value={newProject} onChange={(e) => setNewProject(e.target.value)} onBlur={() => setNewProject(null)} placeholder="Project name" aria-label="Project name" maxLength={40} />
            </form>
          )}
        </div>

        {tags.length > 0 && (
          <div className="nav-section">
            <div className="nav-heading"><span>Tags</span></div>
            <div className="tag-cloud">
              {tags.map(([tag, count]) => (
                <button key={tag} className={`tag-chip${isActive("tag", tag) ? " active" : ""}`} onClick={() => navigate("tag", tag)}>
                  #{tag} {count > 0 && <em>{count}</em>}
                </button>
              ))}
            </div>
          </div>
        )}

        {(focus.running || focus.remaining < focus.duration) && route.name !== "focus" && (
          <button className={`mini-timer ${focus.mode}`} onClick={() => navigate("focus")}>
            <Icon name="focus" size={16} />
            <span>{focus.mode === "focus" ? "Focusing" : "Break"}</span>
            <b>{formatClock(focus.remaining)}</b>
            {!focus.running && <em>paused</em>}
          </button>
        )}

        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => setUI((u) => ({ ...u, settings: true }))}>
            <Icon name="settings" /> <span>Settings</span>
          </button>
          <button className="nav-item" onClick={() => setUI((u) => ({ ...u, help: true }))}>
            <Icon name="keyboard" /> <span>Shortcuts</span> <kbd>?</kbd>
          </button>
        </div>
      </aside>
    </>
  );
}

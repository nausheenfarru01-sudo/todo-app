import { useEffect, useState } from "react";
import { useTasks } from "../store/TaskContext";
import { addDays } from "../lib/date";
import { PRIORITY_META, STATUS_META } from "../lib/selectors";
import Checkbox from "./Checkbox";
import Icon from "./Icon";

export default function TaskDrawer() {
  const { state, actions, ui, setUI, today } = useTasks();
  const task = state.tasks.find((t) => t.id === ui.selectedId);
  const [subtask, setSubtask] = useState("");
  const [tagInput, setTagInput] = useState("");
  const close = () => setUI((u) => ({ ...u, selectedId: null }));

  useEffect(() => {
    setSubtask("");
    setTagInput("");
  }, [ui.selectedId]);

  if (!task) return null;
  const set = (patch) => actions.update(task.id, patch);
  const subDone = task.subtasks.filter((s) => s.done).length;

  const addTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (tag && !task.tags.includes(tag)) set({ tags: [...task.tags, tag] });
    setTagInput("");
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={close} />
      <aside className="drawer" aria-label="Task details">
        <header className="drawer-header">
          <Checkbox checked={task.status === "done"} priority={task.priority} onChange={() => actions.toggle(task.id)} label="Toggle done" />
          <span className="drawer-kicker">{STATUS_META[task.status].label}</span>
          <div className="spacer" />
          <button className="icon-btn" aria-label="Delete task" onClick={() => actions.remove(task.id)}>
            <Icon name="trash" />
          </button>
          <button className="icon-btn" aria-label="Close details" onClick={close}>
            <Icon name="x" />
          </button>
        </header>

        <textarea
          className="drawer-title"
          value={task.title}
          rows={2}
          aria-label="Title"
          onChange={(e) => set({ title: e.target.value.replace(/\n/g, " ") })}
          onBlur={(e) => !e.target.value.trim() && set({ title: "Untitled task" })}
        />

        <label className="field">
          <span>Status</span>
          <div className="segmented">
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <button key={key} type="button" className={task.status === key ? "active" : ""} onClick={() => actions.setStatus(task.id, key)}>
                {meta.label}
              </button>
            ))}
          </div>
        </label>

        <label className="field">
          <span>Priority</span>
          <div className="segmented priority">
            {Object.entries(PRIORITY_META).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                title={meta.label}
                aria-label={meta.label}
                className={task.priority === key ? "active" : ""}
                style={{ "--c": meta.color }}
                onClick={() => set({ priority: key })}
              >
                <Icon name="flag" size={14} /> {key === "none" ? "None" : meta.label}
              </button>
            ))}
          </div>
        </label>

        <div className="field-grid">
          <label className="field">
            <span>Due date</span>
            <div className="due-row">
              <input type="date" value={task.due ?? ""} onChange={(e) => set({ due: e.target.value || null })} />
              <button type="button" className="btn ghost sm" onClick={() => set({ due: today })}>Today</button>
              <button type="button" className="btn ghost sm" onClick={() => set({ due: addDays(today, 1) })}>Tmrw</button>
              {task.due && (
                <button type="button" className="icon-btn" aria-label="Clear due date" onClick={() => set({ due: null })}>
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
          </label>

          <label className="field">
            <span>Project</span>
            <select value={task.projectId ?? ""} onChange={(e) => set({ projectId: e.target.value || null })}>
              <option value="">No project</option>
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="field">
          <span>Tags</span>
          <div className="tag-editor">
            {task.tags.map((tag) => (
              <span key={tag} className="chip removable">
                #{tag}
                <button type="button" aria-label={`Remove tag ${tag}`} onClick={() => set({ tags: task.tags.filter((t) => t !== tag) })}>
                  <Icon name="x" size={11} />
                </button>
              </span>
            ))}
            <form onSubmit={addTag}>
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag…" aria-label="Add tag" />
            </form>
          </div>
        </div>

        <div className="field">
          <span>
            Subtasks {task.subtasks.length > 0 && <em>{subDone}/{task.subtasks.length}</em>}
          </span>
          {task.subtasks.length > 0 && (
            <div className="progress thin"><div style={{ width: `${(subDone / task.subtasks.length) * 100}%` }} /></div>
          )}
          <ul className="subtasks">
            {task.subtasks.map((s) => (
              <li key={s.id} className={s.done ? "done" : ""}>
                <Checkbox checked={s.done} onChange={() => actions.toggleSubtask(task.id, s.id)} label={`Toggle ${s.title}`} />
                <span>{s.title}</span>
                <button className="icon-btn" aria-label={`Delete subtask ${s.title}`} onClick={() => actions.deleteSubtask(task.id, s.id)}>
                  <Icon name="x" size={14} />
                </button>
              </li>
            ))}
          </ul>
          <form
            className="subtask-add"
            onSubmit={(e) => {
              e.preventDefault();
              if (subtask.trim()) actions.addSubtask(task.id, subtask.trim());
              setSubtask("");
            }}
          >
            <Icon name="plus" size={15} />
            <input value={subtask} onChange={(e) => setSubtask(e.target.value)} placeholder="Add a subtask" aria-label="Add a subtask" />
          </form>
        </div>

        <label className="field grow">
          <span>Notes</span>
          <textarea value={task.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Add details, links, ideas…" rows={6} />
        </label>

        <footer className="drawer-footer">
          Created {new Date(task.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          {task.completedAt && <> · Completed {new Date(task.completedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</>}
        </footer>
      </aside>
    </>
  );
}

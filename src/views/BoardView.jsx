import { useState } from "react";
import { useTasks } from "../store/TaskContext";
import { SORTERS, STATUS_META } from "../lib/selectors";
import Icon from "../components/Icon";
import TaskItem from "../components/TaskItem";

const COLUMN_ICON = { todo: "list", doing: "clock", done: "checkCircle" };

export default function BoardView() {
  const { state, actions } = useTasks();
  const [over, setOver] = useState(null);
  const [adding, setAdding] = useState(null);
  const [draft, setDraft] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const tasks = projectFilter ? state.tasks.filter((t) => t.projectId === projectFilter) : state.tasks;

  return (
    <div className="board-view">
      <div className="toolbar">
        <label className="select">
          <Icon name="folder" size={15} />
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} aria-label="Filter by project">
            <option value="">All projects</option>
            {state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <span className="muted hint">Drag cards between columns to change their status</span>
      </div>

      <div className="board">
        {Object.entries(STATUS_META).map(([status, meta]) => {
          const column = tasks.filter((t) => t.status === status).sort(status === "done" ? (a, b) => b.completedAt - a.completedAt : SORTERS.smart);
          return (
            <section
              key={status}
              className={`column ${status}${over === status ? " over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(status);
              }}
              onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/task-id");
                if (id) actions.setStatus(id, status);
                setOver(null);
              }}
              aria-label={meta.label}
            >
              <header>
                <Icon name={COLUMN_ICON[status]} size={16} />
                <h3>{meta.label}</h3>
                <span className="count">{column.length}</span>
                {status !== "done" && (
                  <button className="icon-btn xs" aria-label={`Add task to ${meta.label}`} onClick={() => { setAdding(status); setDraft(""); }}>
                    <Icon name="plus" size={15} />
                  </button>
                )}
              </header>

              {adding === status && (
                <form
                  className="column-add"
                  onSubmit={(e) => {
                    e.preventDefault();
                    actions.addFromText(draft, { status, projectId: projectFilter || null });
                    setDraft("");
                  }}
                >
                  <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => !draft && setAdding(null)} onKeyDown={(e) => e.key === "Escape" && setAdding(null)} placeholder="Task name, then Enter" aria-label="New card" />
                </form>
              )}

              <div className="cards" role="list">
                {column.map((t) => <TaskItem key={t.id} task={t} draggable />)}
                {column.length === 0 && <div className="column-empty">Drop tasks here</div>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

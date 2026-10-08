import { useTasks } from "../store/TaskContext";
import { dueTone, formatDue } from "../lib/date";
import { PRIORITY_META } from "../lib/selectors";
import Checkbox from "./Checkbox";
import Icon from "./Icon";

export default function TaskItem({ task, draggable = false, compact = false }) {
  const { state, actions, today, ui, setUI, navigate } = useTasks();
  const project = state.projects.find((p) => p.id === task.projectId);
  const done = task.status === "done";
  const subDone = task.subtasks.filter((s) => s.done).length;
  const open = () => setUI((u) => ({ ...u, selectedId: task.id }));

  return (
    <div
      className={`task${done ? " done" : ""}${ui.selectedId === task.id ? " selected" : ""}${compact ? " compact" : ""}`}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/task-id", task.id);
        e.dataTransfer.effectAllowed = "move";
        e.currentTarget.classList.add("dragging");
      }}
      onDragEnd={(e) => e.currentTarget.classList.remove("dragging")}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) open();
      }}
      tabIndex={0}
      role="listitem"
      aria-label={task.title}
    >
      <Checkbox
        checked={done}
        priority={task.priority}
        onChange={() => actions.toggle(task.id)}
        label={`Mark “${task.title}” as ${done ? "not done" : "done"}`}
      />

      <div className="task-body">
        <div className="task-title">
          {task.status === "doing" && <span className="pill doing">In progress</span>}
          <span className="title-text">{task.title}</span>
        </div>

        <div className="task-meta">
          {task.due && (
            <span className={`meta due ${done ? "" : dueTone(task.due, today)}`}>
              <Icon name="calendar" size={13} /> {formatDue(task.due, today)}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span className={`meta${subDone === task.subtasks.length ? " complete" : ""}`}>
              <Icon name="subtasks" size={13} /> {subDone}/{task.subtasks.length}
            </span>
          )}
          {task.notes && !compact && (
            <span className="meta" title="Has notes">
              <Icon name="note" size={13} />
            </span>
          )}
          {project && (
            <button
              type="button"
              className="meta project-chip"
              onClick={(e) => {
                e.stopPropagation();
                navigate("project", project.id);
              }}
            >
              <span className="dot" style={{ background: project.color }} />
              {project.name}
            </button>
          )}
          {task.tags.map((tag) => (
            <button
              type="button"
              key={tag}
              className="meta tag-chip"
              onClick={(e) => {
                e.stopPropagation();
                navigate("tag", tag);
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {task.priority !== "none" && (
        <span className="priority-flag" title={`${PRIORITY_META[task.priority].label} priority`} style={{ color: PRIORITY_META[task.priority].color }}>
          <Icon name="flag" size={15} />
        </span>
      )}

      <button
        type="button"
        className="icon-btn task-delete"
        aria-label={`Delete “${task.title}”`}
        onClick={(e) => {
          e.stopPropagation();
          actions.remove(task.id);
        }}
      >
        <Icon name="trash" size={16} />
      </button>
    </div>
  );
}

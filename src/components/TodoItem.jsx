import { useEffect, useRef, useState } from "react";

function TodoItem({ task, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const startEditing = () => {
    setDraft(task.text);
    setEditing(true);
  };

  const save = () => {
    const text = draft.trim();
    if (text) onEdit(task.id, text);
    else onDelete(task.id);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <li className={`todo-item${task.completed ? " completed" : ""}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.text}" as ${task.completed ? "not done" : "done"}`}
      />

      {editing ? (
        <input
          ref={inputRef}
          className="edit-input"
          value={draft}
          maxLength={200}
          aria-label="Edit task"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <span className="todo-text" onDoubleClick={startEditing} title="Double-click to edit">
          {task.text}
        </span>
      )}

      {!editing && (
        <div className="actions">
          <button className="icon-btn" onClick={startEditing} aria-label={`Edit "${task.text}"`}>
            ✎
          </button>
          <button className="icon-btn danger" onClick={() => onDelete(task.id)} aria-label={`Delete "${task.text}"`}>
            ✕
          </button>
        </div>
      )}
    </li>
  );
}

export default TodoItem;

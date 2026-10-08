import { useState } from "react";

const MAX_LENGTH = 200;

function TodoInput({ addTask }) {
  const [task, setTask] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = task.trim();
    if (!text) return;
    addTask(text);
    setTask("");
  };

  return (
    <form className="todo-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="What needs to be done?"
        aria-label="New task"
        value={task}
        maxLength={MAX_LENGTH}
        onChange={(e) => setTask(e.target.value)}
        autoFocus
      />
      <button type="submit" disabled={!task.trim()}>
        Add
      </button>
    </form>
  );
}

export default TodoInput;

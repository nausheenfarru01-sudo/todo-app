import { useMemo, useState } from "react";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import TodoFilters from "./components/TodoFilters";
import { useLocalStorage } from "./hooks/useLocalStorage";
import "./App.css";

const FILTERS = {
  all: () => true,
  active: (task) => !task.completed,
  completed: (task) => task.completed,
};

function App() {
  const [tasks, setTasks] = useLocalStorage("todo-app.tasks", []);
  const [filter, setFilter] = useState("all");

  const addTask = (text) => {
    setTasks((prev) => [
      { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() },
      ...prev,
    ]);
  };

  const toggleTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const editTask = (id, text) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const visibleTasks = useMemo(() => tasks.filter(FILTERS[filter]), [tasks, filter]);
  const remaining = tasks.filter((t) => !t.completed).length;
  const completed = tasks.length - remaining;

  return (
    <main className="app">
      <header className="app-header">
        <h1>To-Do List</h1>
        <p className="subtitle">
          {tasks.length === 0
            ? "Nothing planned yet. Add your first task below."
            : `${remaining} of ${tasks.length} tasks left`}
        </p>
        {tasks.length > 0 && (
          <div
            className="progress"
            role="progressbar"
            aria-label="Tasks completed"
            aria-valuemin={0}
            aria-valuemax={tasks.length}
            aria-valuenow={completed}
          >
            <div className="progress-bar" style={{ width: `${(completed / tasks.length) * 100}%` }} />
          </div>
        )}
      </header>

      <TodoInput addTask={addTask} />

      {tasks.length > 0 && (
        <TodoFilters
          filter={filter}
          onChange={setFilter}
          remaining={remaining}
          completed={completed}
          onClearCompleted={clearCompleted}
        />
      )}

      <TodoList
        tasks={visibleTasks}
        filter={filter}
        hasTasks={tasks.length > 0}
        onToggle={toggleTask}
        onEdit={editTask}
        onDelete={deleteTask}
      />
    </main>
  );
}

export default App;

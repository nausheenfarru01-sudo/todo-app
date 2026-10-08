const LABELS = { all: "All", active: "Active", completed: "Completed" };

function TodoFilters({ filter, onChange, remaining, completed, onClearCompleted }) {
  return (
    <div className="filters">
      <span className="count">
        {remaining} {remaining === 1 ? "item" : "items"} left
      </span>

      <div className="filter-buttons" role="group" aria-label="Filter tasks">
        {Object.entries(LABELS).map(([key, label]) => (
          <button
            key={key}
            className={filter === key ? "active" : ""}
            aria-pressed={filter === key}
            onClick={() => onChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <button className="link-btn" onClick={onClearCompleted} disabled={completed === 0}>
        Clear completed
      </button>
    </div>
  );
}

export default TodoFilters;

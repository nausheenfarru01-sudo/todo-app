import TodoItem from "./TodoItem";

const EMPTY_MESSAGES = {
  all: "No tasks yet.",
  active: "All done! Nothing left to do.",
  completed: "No completed tasks yet.",
};

function TodoList({ tasks, filter, hasTasks, onToggle, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return hasTasks ? <p className="empty">{EMPTY_MESSAGES[filter]}</p> : null;
  }

  return (
    <ul className="todo-list">
      {tasks.map((task) => (
        <TodoItem key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}

export default TodoList;

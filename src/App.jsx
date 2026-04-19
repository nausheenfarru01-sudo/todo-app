import { useState } from "react";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";

function App() {
 const [tasks, setTasks] = useState([]);

 const addTask = (task) => {
   setTasks([...tasks, task]);
 };

 const deleteTask = (index) => {
   const newTasks = tasks.filter((_, i) => i !== index);
   setTasks(newTasks);
 };

 return (
   <div style={{ padding: "20px" }}>
     <h2>Todo App</h2>

     <TodoInput addTask={addTask} />
     <TodoList tasks={tasks} deleteTask={deleteTask} />
   </div>
 );
}

export default App;

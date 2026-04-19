import { useState } from "react";

function TodoInput({ addTask }) {
 const [task, setTask] = useState("");

 const handleAdd = () => {
   if (task !== "") {
     addTask(task);
     setTask("");
   }
 };

 return (
   <div>
     <input
       type="text"
       placeholder="Enter task"
       value={task}
       onChange={(e) => setTask(e.target.value)}
     />
     <button onClick={handleAdd}>Add</button>
   </div>
 );
}

export default TodoInput;

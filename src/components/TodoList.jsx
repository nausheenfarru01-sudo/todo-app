function TodoList({ tasks, deleteTask }) {
 return (
   <ul>
     {tasks.map((t, index) => (
       <li key={index}>
         {t}
         <button onClick={() => deleteTask(index)}>Delete</button>
       </li>
     ))}
   </ul>
 );
}

export default TodoList;

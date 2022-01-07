import React from "react";
import { ITask } from "../interfaces";

interface Props {
    task:ITask;
    completeTask(taskNamemToDelete:string):void;
}

const TodoTask = ({task,completeTask}:Props) => {
    return <div className="task">
        <div className="content">
            <span>{task.taskName}</span>
            <span>{task.deadline}</span>
            <button onClick={()=>{completeTask(task.taskName)}}>X</button>
        </div>
    </div>
};

export default TodoTask;
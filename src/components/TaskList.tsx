
import { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onUpdateProgress: (taskId: string, progressMade: string, progressToGo: string) => void;
}

export function TaskList({ tasks, onDeleteTask, onUpdateProgress }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="font-medium text-lg mb-2">No tasks yet</h3>
        <p className="text-muted-foreground">Add your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onDelete={onDeleteTask} 
          onUpdateProgress={onUpdateProgress}
        />
      ))}
    </div>
  );
}

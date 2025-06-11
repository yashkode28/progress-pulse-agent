import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { ReminderBanner } from "@/components/ReminderBanner";
import { Header } from "@/components/Header";
import { Task } from "@/types/task";
import { toast } from "sonner";
import homepageImage from "@/assets/Homepage.png";

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("progressPulseTasks");
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error("Error parsing saved tasks:", error);
        toast.error("There was an error loading your tasks");
      }
    }
  }, []);
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("progressPulseTasks", JSON.stringify(tasks));
  }, [tasks]);
  
  const handleAddTask = (newTask: Task) => {
    setTasks([...tasks, newTask]);
    setIsDialogOpen(false);
  };
  
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast.success("Task deleted successfully");
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container py-6 md:py-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Your AI assistant to track progress, so you don't have to
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0">
                <Plus className="w-4 h-4 mr-2" />
                Add New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create a new task</DialogTitle>
              </DialogHeader>
              <TaskForm 
                onSubmit={handleAddTask} 
                onCancel={() => setIsDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          <div className="flex-1">
            <img 
              src={homepageImage} 
              alt="Progress Pulse Dashboard" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          <div className="flex-1 flex justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6">
              Sign Up Now
            </Button>
          </div>
        </div>
        
        <ReminderBanner tasks={tasks} />
        
        <TaskList tasks={tasks} onDeleteTask={handleDeleteTask} />
      </div>
    </div>
  );
}

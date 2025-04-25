
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Task } from "@/types/task";
import { calculateProgress, formatRemainingTime, getNextReminder } from "@/utils/taskUtils";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const progress = calculateProgress(task);
  const nextReminder = getNextReminder(task);
  const remainingTime = formatRemainingTime(task);

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium line-clamp-1">{task.title}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onDelete(task.id)}
          >
            <span className="sr-only">Delete</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </Button>
        </div>
        <CardDescription>
          Due in {remainingTime}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex flex-col gap-2 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Reminders every {task.reminderFrequency} days</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {progress < 100 ? (
                <>
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <span>Next reminder: {nextReminder}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Task completed!</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs w-full justify-start p-0 h-8"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide details" : "Show details"}
        </Button>
      </CardFooter>
      
      {expanded && (
        <div className="px-6 pb-4 pt-0">
          <p className="text-sm text-muted-foreground">{task.description}</p>
        </div>
      )}
    </Card>
  );
}

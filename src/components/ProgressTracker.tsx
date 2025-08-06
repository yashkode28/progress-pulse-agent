import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Zap } from "lucide-react";
import { Task } from "@/types/task";

interface ProgressTrackerProps {
  task: Task;
  onUpdateProgress: (taskId: string, progressMade: string, progressToGo: string) => void;
}

export function ProgressTracker({ task, onUpdateProgress }: ProgressTrackerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateProgress = async () => {
    setIsLoading(true);
    try {
      // This will be implemented with AI agent
      const progressMade = "AI-generated progress assessment...";
      const progressToGo = "AI-generated remaining tasks...";
      
      onUpdateProgress(task.id, progressMade, progressToGo);
      
      // For now, simulate API call
      setTimeout(() => {
        onUpdateProgress(
          task.id, 
          "You've made good progress on this task. Recent activities show consistent effort.",
          "Continue with your current approach. Next steps include focusing on completion details."
        );
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error generating progress:", error);
      setIsLoading(false);
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "Not set";
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDays = (days?: number[]) => {
    if (!days || days.length === 0) return "Not set";
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(d => dayNames[d - 1]).join(', ');
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription className="mt-1">
              {task.description || "No description provided"}
            </CardDescription>
          </div>
          {task.isRecurring && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Recurring
            </Badge>
          )}
        </div>
        
        {task.isRecurring && (
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>Days: {formatDays(task.daysOfWeek)}</span>
            <span>•</span>
            <span>Completion: {formatTime(task.completionTime)}</span>
            <span>•</span>
            <span>Reminder: {formatTime(task.reminderTime)}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <h4 className="font-medium">Progress Made</h4>
            </div>
            {task.progressMade ? (
              <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded-md border">
                {task.progressMade}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No progress assessment yet
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium">Progress To Go</h4>
            </div>
            {task.progressToGo ? (
              <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md border">
                {task.progressToGo}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No progress forecast yet
              </p>
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleGenerateProgress}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          {isLoading ? "Generating AI Analysis..." : "Generate Progress Update"}
        </Button>
      </CardContent>
    </Card>
  );
}
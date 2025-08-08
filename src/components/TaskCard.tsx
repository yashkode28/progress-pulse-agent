
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertCircle, CheckCircle, Target, Zap, RefreshCw } from "lucide-react";
import { Task } from "@/types/task";
import { calculateProgress, formatRemainingTime, getNextReminder } from "@/utils/taskUtils";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onUpdateProgress: (taskId: string, progressMade: string, progressToGo: string) => void;
}

export function TaskCard({ task, onDelete, onUpdateProgress }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const progress = calculateProgress(task);
  const nextReminder = getNextReminder(task);
  const remainingTime = formatRemainingTime(task);

  const handleGenerateProgress = async () => {
    setIsUpdatingProgress(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-task-progress', {
        body: { task }
      });

      if (error) {
        console.error('Error calling progress analysis:', error);
        throw new Error(error.message);
      }

      const { progressMade, progressToGo } = data;
      onUpdateProgress(task.id, progressMade, progressToGo);
      
    } catch (error) {
      console.error("Error generating progress:", error);
      // Fallback to basic progress update
      if (task.isRecurring) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        onUpdateProgress(
          task.id,
          `Task tracked consistently. Today is ${today}.`,
          `Continue your routine. Stay consistent with your schedule.`
        );
      } else {
        const elapsed = Math.floor((Date.now() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const remaining = Math.max(0, task.durationDays - elapsed);
        onUpdateProgress(
          task.id,
          `Working on this for ${elapsed} days with steady progress.`,
          `${remaining} days remaining. Focus on key deliverables.`
        );
      }
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return null;
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDays = (days?: number[]) => {
    if (!days || days.length === 0) return null;
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(d => dayNames[d - 1]).join(', ');
  };

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
          {task.isRecurring 
            ? `Recurring • ${formatDays(task.daysOfWeek) || 'Daily'}`
            : `Due in ${remainingTime}`
          }
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
            {task.isRecurring ? (
              <>
                {formatTime(task.completionTime) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Complete at {formatTime(task.completionTime)}</span>
                  </div>
                )}
                {formatTime(task.reminderTime) && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <span>Remind at {formatTime(task.reminderTime)}</span>
                  </div>
                )}
              </>
            ) : (
              <>
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
              </>
            )}
            {(task.progressMade || task.progressToGo) && (
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                {task.progressMade && <p>AI update: {task.progressMade}</p>}
                {task.progressToGo && <p>Next: {task.progressToGo}</p>}
              </div>
            )}
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
        <div className="px-6 pb-4 pt-0 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {task.progressMade && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Progress Made</span>
                </div>
                <p className="text-xs text-muted-foreground bg-green-50 p-2 rounded border">
                  {task.progressMade}
                </p>
              </div>
            )}
            
            {task.progressToGo && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Progress To Go</span>
                </div>
                <p className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border">
                  {task.progressToGo}
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleGenerateProgress}
              disabled={isUpdatingProgress}
              size="sm"
              variant="outline"
              className="w-full"
            >
              {isUpdatingProgress ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-2" />
                  Update Progress
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

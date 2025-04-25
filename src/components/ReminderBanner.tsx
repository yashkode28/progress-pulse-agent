
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getTasksDueForReminder } from "@/utils/taskUtils";
import { Task } from "@/types/task";

interface ReminderBannerProps {
  tasks: Task[];
}

export function ReminderBanner({ tasks }: ReminderBannerProps) {
  const [dueTasks, setDueTasks] = useState<Task[]>([]);
  const [dismissed, setDismissed] = useState(false);
  
  useEffect(() => {
    // Simulate checking for tasks that need reminders today
    const tasksNeedingReminder = getTasksDueForReminder(tasks);
    setDueTasks(tasksNeedingReminder);
  }, [tasks]);
  
  if (dismissed || dueTasks.length === 0) return null;
  
  return (
    <Alert variant="default" className="mb-6 border-primary/50 bg-primary/10">
      <AlertCircle className="h-4 w-4 text-primary" />
      <div className="flex-1">
        <AlertTitle>Reminder</AlertTitle>
        <AlertDescription>
          You have {dueTasks.length} task{dueTasks.length !== 1 ? 's' : ''} that need{dueTasks.length === 1 ? 's' : ''} your attention today.
        </AlertDescription>
      </div>
      <Button variant="outline" size="sm" onClick={() => setDismissed(true)}>
        Dismiss
      </Button>
    </Alert>
  );
}


import { Task } from "@/types/task";
import { addDays, format, differenceInDays } from "date-fns";

export function calculateProgress(task: Task): number {
  if (task.completed) return 100;
  
  const today = new Date();
  const totalDays = task.durationDays;
  const daysPassed = differenceInDays(today, task.createdAt);
  
  if (daysPassed >= totalDays) return 100;
  
  const progress = Math.round((daysPassed / totalDays) * 100);
  return Math.min(progress, 100);
}

export function getNextReminder(task: Task): string {
  if (task.completed) return "No reminders";
  
  const today = new Date();
  const creationDate = new Date(task.createdAt);
  const daysSinceCreation = differenceInDays(today, creationDate);
  
  const daysSinceLastReminder = daysSinceCreation % task.reminderFrequency;
  const daysUntilNextReminder = task.reminderFrequency - daysSinceLastReminder;
  
  const nextReminderDate = addDays(today, daysUntilNextReminder);
  return format(nextReminderDate, "MMM d, yyyy");
}

export function formatRemainingTime(task: Task): string {
  const today = new Date();
  const creationDate = new Date(task.createdAt);
  const dueDate = addDays(creationDate, task.durationDays);
  
  const daysRemaining = differenceInDays(dueDate, today);
  
  if (daysRemaining < 0) return "Overdue";
  if (daysRemaining === 0) return "Today";
  if (daysRemaining === 1) return "Tomorrow";
  
  return `${daysRemaining} days`;
}

export function getTasksDueForReminder(tasks: Task[]): Task[] {
  const today = new Date();
  
  return tasks.filter(task => {
    if (task.completed) return false;
    
    const daysSinceCreation = differenceInDays(today, new Date(task.createdAt));
    return daysSinceCreation % task.reminderFrequency === 0;
  });
}

export function getExpectedProgress(task: Task): string {
  const today = new Date();
  const creationDate = new Date(task.createdAt);
  const daysPassed = differenceInDays(today, creationDate);
  const totalDays = task.durationDays;
  
  const expectedProgress = Math.round((daysPassed / totalDays) * 100);
  
  if (expectedProgress >= 100) return "Task should be completed";
  return `You should be ${Math.min(expectedProgress, 100)}% complete`;
}

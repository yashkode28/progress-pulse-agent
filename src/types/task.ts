
export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  durationDays: number;
  reminderFrequency: number;
  completed: boolean;
  isRecurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly';
  daysOfWeek?: number[]; // 1=Monday, 7=Sunday
  reminderTime?: string; // HH:MM format
  completionTime?: string; // HH:MM format for when to complete task
  nextReminderDate?: Date;
  progressMade?: string;
  progressToGo?: string;
}

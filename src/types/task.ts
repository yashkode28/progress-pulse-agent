
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
  // New optional fields for enhanced scheduling and agent support
  durationUnit?: 'days' | 'weeks' | 'months';
  reminderUnit?: 'days' | 'weeks' | 'months';
  reminderDaysOfWeek?: number[]; // Days to receive reminders (1=Mon ... 7=Sun)
  steps?: { id: string; text: string; completed: boolean; completedAt?: Date }[];
}

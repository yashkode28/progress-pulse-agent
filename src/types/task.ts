
export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  durationDays: number;
  reminderFrequency: number;
  completed: boolean;
}

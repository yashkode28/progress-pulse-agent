import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from 'uuid';
import { Task } from "@/types/task";
import { DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }).max(50, {
    message: "Title must not exceed 50 characters."
  }),
  description: z.string().max(500, {
    message: "Description must not exceed 500 characters."
  }).optional(),
  duration: z.coerce.number().min(1, {
    message: "Duration must be at least 1 day."
  }).max(365, {
    message: "Duration cannot exceed 365 days."
  }),
  reminderFrequency: z.coerce.number().min(1, {
    message: "Reminder frequency must be at least 1 day."
  }).max(30, {
    message: "Reminder frequency cannot exceed 30 days."
  }),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.enum(['daily', 'weekly']).optional(),
  daysOfWeek: z.array(z.number()).optional(),
  reminderTime: z.string().optional(),
  completionTime: z.string().optional(),
});

interface TaskFormEnhancedProps {
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

export function TaskFormEnhanced({ onSubmit, onCancel }: TaskFormEnhancedProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 14,
      reminderFrequency: 2,
      isRecurring: false,
      recurrencePattern: 'weekly',
      daysOfWeek: [],
      reminderTime: "",
      completionTime: "",
    },
  });

  const isRecurring = form.watch("isRecurring");

  const daysOfWeek = [
    { id: 1, label: "Mon", name: "Monday" },
    { id: 2, label: "Tue", name: "Tuesday" },
    { id: 3, label: "Wed", name: "Wednesday" },
    { id: 4, label: "Thu", name: "Thursday" },
    { id: 5, label: "Fri", name: "Friday" },
    { id: 6, label: "Sat", name: "Saturday" },
    { id: 7, label: "Sun", name: "Sunday" },
  ];

  const handleDayToggle = (dayId: number) => {
    const newSelectedDays = selectedDays.includes(dayId)
      ? selectedDays.filter(d => d !== dayId)
      : [...selectedDays, dayId];
    
    setSelectedDays(newSelectedDays);
    form.setValue("daysOfWeek", newSelectedDays);
  };

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const newTask: Task = {
      id: uuidv4(),
      title: values.title,
      description: values.description || "",
      createdAt: new Date(),
      durationDays: values.duration,
      reminderFrequency: values.reminderFrequency,
      completed: false,
      isRecurring: values.isRecurring,
      recurrencePattern: values.isRecurring ? values.recurrencePattern : undefined,
      daysOfWeek: values.isRecurring ? values.daysOfWeek : undefined,
      reminderTime: values.reminderTime || undefined,
      completionTime: values.completionTime || undefined,
    };
    
    onSubmit(newTask);
    toast.success("Task created successfully");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Complete project proposal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add details about your task..." 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Recurring Task
                </FormLabel>
                <FormDescription>
                  This task repeats on a schedule
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {isRecurring && (
          <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <h4 className="font-medium">Recurrence Settings</h4>
            
            <FormField
              control={form.control}
              name="recurrencePattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurrence Pattern</FormLabel>
                  <FormControl>
                    <select 
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("recurrencePattern") === "weekly" && (
              <div>
                <FormLabel>Days of Week</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`day-${day.id}`}
                        checked={selectedDays.includes(day.id)}
                        onCheckedChange={() => handleDayToggle(day.id)}
                      />
                      <label
                        htmlFor={`day-${day.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reminderTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder Time</FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  When to remind you
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="completionTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Completion Time</FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  When to complete task
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {!isRecurring && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (days)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={365} {...field} />
                  </FormControl>
                  <FormDescription>
                    How many days to complete?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reminderFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder Frequency</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={30} {...field} />
                  </FormControl>
                  <FormDescription>
                    Remind every X days
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        <DialogFooter className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Task</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
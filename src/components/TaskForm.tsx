
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
});

interface TaskFormProps {
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

export function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 14,
      reminderFrequency: 2,
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const newTask: Task = {
      id: uuidv4(),
      title: values.title,
      description: values.description || "",
      createdAt: new Date(),
      durationDays: values.duration,
      reminderFrequency: values.reminderFrequency,
      completed: false,
    };
    
    onSubmit(newTask);
    toast.success("Task created successfully");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

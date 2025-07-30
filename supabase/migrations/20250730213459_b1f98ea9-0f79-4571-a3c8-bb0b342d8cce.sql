-- Enable Row Level Security on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks table
CREATE POLICY "Users can view their own tasks" 
ON public.tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON public.tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for reminders table (linked to tasks via task_id)
CREATE POLICY "Users can view reminders for their own tasks" 
ON public.reminders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE public.tasks.id = public.reminders.task_id 
    AND public.tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create reminders for their own tasks" 
ON public.reminders 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE public.tasks.id = public.reminders.task_id 
    AND public.tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update reminders for their own tasks" 
ON public.reminders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE public.tasks.id = public.reminders.task_id 
    AND public.tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete reminders for their own tasks" 
ON public.reminders 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE public.tasks.id = public.reminders.task_id 
    AND public.tasks.user_id = auth.uid()
  )
);

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);

-- Fix the update_updated_at function security
DROP FUNCTION IF EXISTS public.update_updated_at();
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for tasks table
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
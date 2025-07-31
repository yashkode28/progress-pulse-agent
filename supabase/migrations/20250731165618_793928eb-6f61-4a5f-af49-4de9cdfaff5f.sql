-- Update tasks table to support recurring tasks and time-based reminders
ALTER TABLE public.tasks 
ADD COLUMN is_recurring boolean DEFAULT false,
ADD COLUMN recurrence_pattern text, -- 'daily', 'weekly', 'monthly'
ADD COLUMN days_of_week integer[], -- [1,3,5] for Mon, Wed, Fri (1-7)
ADD COLUMN reminder_time time, -- specific time for reminders
ADD COLUMN next_reminder_date timestamp with time zone;

-- Create notifications table to store AI-generated notifications
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  task_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  notification_type text NOT NULL DEFAULT 'reminder', -- 'reminder', 'overdue', 'completion'
  scheduled_for timestamp with time zone NOT NULL,
  sent_at timestamp with time zone,
  dismissed_at timestamp with time zone,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Create index for efficient querying
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_task_id ON public.notifications(task_id);
CREATE INDEX idx_notifications_scheduled_for ON public.notifications(scheduled_for);

-- Create function to calculate next reminder date for recurring tasks
CREATE OR REPLACE FUNCTION calculate_next_reminder(
  p_task_id uuid,
  p_is_recurring boolean,
  p_recurrence_pattern text,
  p_days_of_week integer[],
  p_reminder_time time,
  p_current_date timestamp with time zone DEFAULT now()
) RETURNS timestamp with time zone
LANGUAGE plpgsql
AS $$
DECLARE
  next_date timestamp with time zone;
  target_time timestamp with time zone;
  current_day_of_week integer;
  next_day integer;
  days_ahead integer;
BEGIN
  -- If not recurring, return null
  IF NOT p_is_recurring THEN
    RETURN NULL;
  END IF;
  
  -- Get current day of week (1 = Monday, 7 = Sunday)
  current_day_of_week := EXTRACT(DOW FROM p_current_date);
  IF current_day_of_week = 0 THEN
    current_day_of_week := 7; -- Convert Sunday from 0 to 7
  END IF;
  
  IF p_recurrence_pattern = 'weekly' AND p_days_of_week IS NOT NULL THEN
    -- Find next occurrence day
    next_day := NULL;
    
    -- First check if there's a day later today
    FOREACH days_ahead IN ARRAY p_days_of_week LOOP
      IF days_ahead >= current_day_of_week THEN
        next_day := days_ahead;
        EXIT;
      END IF;
    END LOOP;
    
    -- If no day found this week, get first day of next week
    IF next_day IS NULL THEN
      next_day := p_days_of_week[1];
      days_ahead := 7 - current_day_of_week + next_day;
    ELSE
      days_ahead := next_day - current_day_of_week;
    END IF;
    
    -- Calculate target date
    target_time := (p_current_date::date + days_ahead) + p_reminder_time;
    
    -- If it's today but time has passed, move to next occurrence
    IF days_ahead = 0 AND target_time <= p_current_date THEN
      -- Find next day in the week
      next_day := NULL;
      FOREACH days_ahead IN ARRAY p_days_of_week LOOP
        IF days_ahead > current_day_of_week THEN
          next_day := days_ahead;
          EXIT;
        END IF;
      END LOOP;
      
      IF next_day IS NULL THEN
        next_day := p_days_of_week[1];
        days_ahead := 7 - current_day_of_week + next_day;
      ELSE
        days_ahead := next_day - current_day_of_week;
      END IF;
      
      target_time := (p_current_date::date + days_ahead) + p_reminder_time;
    END IF;
    
    RETURN target_time;
  END IF;
  
  -- Default daily recurrence
  IF p_recurrence_pattern = 'daily' THEN
    target_time := p_current_date::date + p_reminder_time;
    IF target_time <= p_current_date THEN
      target_time := target_time + interval '1 day';
    END IF;
    RETURN target_time;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger to automatically calculate next reminder date
CREATE OR REPLACE FUNCTION update_next_reminder_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_recurring AND NEW.reminder_time IS NOT NULL THEN
    NEW.next_reminder_date := calculate_next_reminder(
      NEW.id,
      NEW.is_recurring,
      NEW.recurrence_pattern,
      NEW.days_of_week,
      NEW.reminder_time
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_next_reminder_date
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_next_reminder_date();
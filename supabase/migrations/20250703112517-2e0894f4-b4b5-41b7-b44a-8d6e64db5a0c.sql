
-- Create streak notifications table
CREATE TABLE IF NOT EXISTS public.streak_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('streak_warning', 'streak_lost')),
  streak_count INTEGER NOT NULL DEFAULT 0,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index instead of constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_streak_notifications_unique 
ON public.streak_notifications(conversation_id, user_id, notification_type, date(scheduled_for));

-- Enable RLS on streak_notifications
ALTER TABLE public.streak_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for streak_notifications
CREATE POLICY "Users can view their own streak notifications" ON public.streak_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage streak notifications" ON public.streak_notifications
  FOR ALL USING (true);

-- Add last_activity_date to conversations for better streak tracking
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS last_activity_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS streak_last_reset_date DATE DEFAULT CURRENT_DATE;

-- Function to check and update streak status
CREATE OR REPLACE FUNCTION public.check_and_update_streak(conv_id UUID)
RETURNS TABLE(current_streak INTEGER, streak_status TEXT, last_activity DATE)
LANGUAGE plpgsql
AS $$
DECLARE
  conv_record RECORD;
  today_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
  has_activity_today BOOLEAN := false;
  has_activity_yesterday BOOLEAN := false;
  new_streak INTEGER := 0;
  status TEXT := 'active';
BEGIN
  -- Get conversation details
  SELECT * INTO conv_record FROM public.conversations WHERE id = conv_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 'not_found'::TEXT, NULL::DATE;
    RETURN;
  END IF;
  
  -- Check for messages today
  SELECT EXISTS(
    SELECT 1 FROM public.messages 
    WHERE (sender_id = conv_record.participant_1 AND recipient_id = conv_record.participant_2)
       OR (sender_id = conv_record.participant_2 AND recipient_id = conv_record.participant_1)
    AND DATE(created_at) = today_date
  ) INTO has_activity_today;
  
  -- Check for messages yesterday
  SELECT EXISTS(
    SELECT 1 FROM public.messages 
    WHERE (sender_id = conv_record.participant_1 AND recipient_id = conv_record.participant_2)
       OR (sender_id = conv_record.participant_2 AND recipient_id = conv_record.participant_1)
    AND DATE(created_at) = yesterday_date
  ) INTO has_activity_yesterday;
  
  -- Determine new streak count
  IF has_activity_today THEN
    -- Continue or start streak
    IF conv_record.last_activity_date = yesterday_date THEN
      new_streak := COALESCE(conv_record.streak_count, 0) + 1;
    ELSE
      new_streak := 1; -- Reset to 1 if there was a gap
    END IF;
    status := 'active';
  ELSIF conv_record.last_activity_date < yesterday_date THEN
    -- Streak is broken
    new_streak := 0;
    status := 'lost';
  ELSE
    -- No activity today, keep current streak
    new_streak := COALESCE(conv_record.streak_count, 0);
    status := 'at_risk';
  END IF;
  
  -- Update conversation
  UPDATE public.conversations 
  SET 
    streak_count = new_streak,
    last_activity_date = CASE WHEN has_activity_today THEN today_date ELSE COALESCE(last_activity_date, today_date) END,
    streak_last_reset_date = CASE WHEN new_streak = 0 THEN today_date ELSE streak_last_reset_date END,
    last_message_at = CASE WHEN has_activity_today THEN now() ELSE last_message_at END
  WHERE id = conv_id;
  
  RETURN QUERY SELECT new_streak, status, COALESCE(conv_record.last_activity_date, today_date);
END;
$$;

-- Function to schedule streak warning notifications
CREATE OR REPLACE FUNCTION public.schedule_streak_warnings()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  conv_record RECORD;
  warning_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Find conversations with active streaks that need warnings
  FOR conv_record IN 
    SELECT c.*, p1.id as user1_id, p2.id as user2_id
    FROM public.conversations c
    JOIN public.profiles p1 ON p1.id = c.participant_1
    JOIN public.profiles p2 ON p2.id = c.participant_2
    WHERE c.streak_count > 0 
    AND c.last_activity_date < CURRENT_DATE
    AND c.last_activity_date >= CURRENT_DATE - INTERVAL '1 day'
  LOOP
    -- Schedule warning notification for both participants
    warning_time := CURRENT_DATE + INTERVAL '23 hours';
    
    -- Insert warning for participant 1
    INSERT INTO public.streak_notifications (conversation_id, user_id, notification_type, streak_count, scheduled_for)
    VALUES (conv_record.id, conv_record.user1_id, 'streak_warning', conv_record.streak_count, warning_time)
    ON CONFLICT DO NOTHING;
    
    -- Insert warning for participant 2
    INSERT INTO public.streak_notifications (conversation_id, user_id, notification_type, streak_count, scheduled_for)
    VALUES (conv_record.id, conv_record.user2_id, 'streak_warning', conv_record.streak_count, warning_time)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- Function to process streak notifications
CREATE OR REPLACE FUNCTION public.process_streak_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  notif_record RECORD;
  other_user_id UUID;
  other_user_name TEXT;
BEGIN
  -- Process pending streak notifications
  FOR notif_record IN 
    SELECT sn.*, c.participant_1, c.participant_2
    FROM public.streak_notifications sn
    JOIN public.conversations c ON c.id = sn.conversation_id
    WHERE sn.scheduled_for <= now()
    AND sn.sent_at IS NULL
  LOOP
    -- Determine the other user
    IF notif_record.user_id = notif_record.participant_1 THEN
      other_user_id := notif_record.participant_2;
    ELSE
      other_user_id := notif_record.participant_1;
    END IF;
    
    -- Get other user's name
    SELECT COALESCE(display_name, username, 'Unknown User') INTO other_user_name
    FROM public.profiles WHERE id = other_user_id;
    
    -- Create notification
    IF notif_record.notification_type = 'streak_warning' THEN
      INSERT INTO public.notifications (user_id, type, actor_id, message, data)
      VALUES (
        notif_record.user_id,
        'streak_warning',
        other_user_id,
        format('Your %s-day streak with %s is at risk! Send a message to keep it going.', notif_record.streak_count, other_user_name),
        jsonb_build_object('conversation_id', notif_record.conversation_id, 'streak_count', notif_record.streak_count)
      );
    ELSIF notif_record.notification_type = 'streak_lost' THEN
      INSERT INTO public.notifications (user_id, type, actor_id, message, data)
      VALUES (
        notif_record.user_id,
        'streak_lost',
        other_user_id,
        format('You lost your %s-day streak with %s. Start chatting again to begin a new streak!', notif_record.streak_count, other_user_name),
        jsonb_build_object('conversation_id', notif_record.conversation_id, 'streak_count', notif_record.streak_count)
      );
    END IF;
    
    -- Mark notification as sent
    UPDATE public.streak_notifications 
    SET sent_at = now() 
    WHERE id = notif_record.id;
  END LOOP;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_last_activity ON public.conversations(last_activity_date);
CREATE INDEX IF NOT EXISTS idx_streak_notifications_scheduled ON public.streak_notifications(scheduled_for) WHERE sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_date ON public.messages(date(created_at));

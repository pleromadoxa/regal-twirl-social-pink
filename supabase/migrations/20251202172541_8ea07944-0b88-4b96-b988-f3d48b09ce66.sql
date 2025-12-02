-- Create email notifications log table to track sent emails
CREATE TABLE IF NOT EXISTS public.email_notifications_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for efficient lookups
CREATE INDEX idx_email_notifications_log_user_type ON public.email_notifications_log(user_id, notification_type);
CREATE INDEX idx_email_notifications_log_sent_at ON public.email_notifications_log(sent_at);

-- Enable RLS
ALTER TABLE public.email_notifications_log ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage (no user access needed)
CREATE POLICY "Service role can manage email logs"
ON public.email_notifications_log
FOR ALL
USING (true)
WITH CHECK (true);

-- Add email column to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_notifications_enabled') THEN
    ALTER TABLE public.profiles ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;
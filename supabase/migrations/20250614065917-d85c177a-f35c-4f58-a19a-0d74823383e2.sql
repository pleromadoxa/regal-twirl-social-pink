
-- Add missing columns for user settings for real-time sync

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS push_notifications boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS private_account boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_online_status boolean DEFAULT true;

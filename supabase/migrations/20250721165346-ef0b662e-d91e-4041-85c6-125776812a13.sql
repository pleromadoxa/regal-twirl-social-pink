-- Add missing account_status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN account_status text DEFAULT 'active',
ADD COLUMN status_reason text,
ADD COLUMN status_until timestamp with time zone;
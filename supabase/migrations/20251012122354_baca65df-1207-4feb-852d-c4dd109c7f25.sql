-- Drop the existing check constraint
ALTER TABLE public.stories DROP CONSTRAINT IF EXISTS stories_content_type_check;

-- Add the updated check constraint to include 'live_stream'
ALTER TABLE public.stories ADD CONSTRAINT stories_content_type_check 
CHECK (content_type IN ('image', 'video', 'live_stream'));
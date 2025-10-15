-- Add foreign key constraint for profiles table
ALTER TABLE public.circle_messages
DROP CONSTRAINT IF EXISTS circle_messages_sender_id_fkey;

ALTER TABLE public.circle_messages
ADD CONSTRAINT circle_messages_sender_id_fkey
FOREIGN KEY (sender_id) 
REFERENCES public.profiles(id)
ON DELETE CASCADE;
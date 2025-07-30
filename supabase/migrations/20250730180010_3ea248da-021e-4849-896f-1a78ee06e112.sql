-- Fix foreign key relationship between posts and profiles
-- The posts table should have a proper foreign key constraint to profiles table

ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

ALTER TABLE public.posts 
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also fix the replies table foreign key to profiles  
ALTER TABLE public.replies
DROP CONSTRAINT IF EXISTS replies_user_id_fkey;

ALTER TABLE public.replies
ADD CONSTRAINT replies_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
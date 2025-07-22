-- Add foreign key relationship between community_discussions and profiles
ALTER TABLE public.community_discussions 
ADD CONSTRAINT community_discussions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key relationship between community_discussion_replies and profiles  
ALTER TABLE public.community_discussion_replies 
ADD CONSTRAINT community_discussion_replies_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key relationship between community_discussion_likes and profiles
ALTER TABLE public.community_discussion_likes 
ADD CONSTRAINT community_discussion_likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key relationship between community_discussion_replies and community_discussions
ALTER TABLE public.community_discussion_replies 
ADD CONSTRAINT community_discussion_replies_discussion_id_fkey 
FOREIGN KEY (discussion_id) REFERENCES public.community_discussions(id) ON DELETE CASCADE;

-- Add foreign key relationship between community_discussion_likes and community_discussions
ALTER TABLE public.community_discussion_likes 
ADD CONSTRAINT community_discussion_likes_discussion_id_fkey 
FOREIGN KEY (discussion_id) REFERENCES public.community_discussions(id) ON DELETE CASCADE;

-- Add foreign key relationship between music_tracks and profiles
ALTER TABLE public.music_tracks 
ADD CONSTRAINT music_tracks_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_music_tracks_user_id_profiles ON public.music_tracks(user_id);

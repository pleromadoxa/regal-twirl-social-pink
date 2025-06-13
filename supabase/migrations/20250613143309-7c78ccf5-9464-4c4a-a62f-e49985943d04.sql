
-- Create a table for music tracks
CREATE TABLE public.music_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration INTEGER, -- in seconds
  file_url TEXT NOT NULL,
  file_size INTEGER,
  genre TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  plays_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for music likes
CREATE TABLE public.music_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track_id UUID NOT NULL REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, track_id)
);

-- Create a table for music playlists
CREATE TABLE public.music_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  tracks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_playlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for music_tracks
CREATE POLICY "Users can view public tracks" 
  ON public.music_tracks 
  FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own tracks" 
  ON public.music_tracks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracks" 
  ON public.music_tracks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracks" 
  ON public.music_tracks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for music_likes
CREATE POLICY "Users can view all music likes" 
  ON public.music_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own music likes" 
  ON public.music_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music likes" 
  ON public.music_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for music_playlists
CREATE POLICY "Users can view public playlists" 
  ON public.music_playlists 
  FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" 
  ON public.music_playlists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
  ON public.music_playlists 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
  ON public.music_playlists 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create storage bucket for music files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('music-files', 'music-files', true);

-- Storage policies for music files
CREATE POLICY "Users can upload music files" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'music-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view music files" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'music-files');

CREATE POLICY "Users can update their own music files" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'music-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own music files" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'music-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to update music likes count
CREATE OR REPLACE FUNCTION public.update_music_likes_count()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.music_tracks 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.track_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.music_tracks 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.track_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create triggers
CREATE TRIGGER music_likes_count_trigger
  AFTER INSERT OR DELETE ON public.music_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_music_likes_count();

-- Create indexes for better performance
CREATE INDEX idx_music_tracks_user_id ON public.music_tracks(user_id);
CREATE INDEX idx_music_tracks_genre ON public.music_tracks(genre);
CREATE INDEX idx_music_tracks_created_at ON public.music_tracks(created_at DESC);
CREATE INDEX idx_music_likes_track_id ON public.music_likes(track_id);
CREATE INDEX idx_music_playlists_user_id ON public.music_playlists(user_id);

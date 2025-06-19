
-- Create post_views table to track views for each post
CREATE TABLE public.post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ip_address INET,
  user_agent TEXT
);

-- Add views_count column to posts table
ALTER TABLE public.posts ADD COLUMN views_count INTEGER DEFAULT 0;

-- Add RLS policies for post_views
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view post views (for counting)
CREATE POLICY "Anyone can view post views" 
ON public.post_views 
FOR SELECT 
USING (true);

-- Allow authenticated users to insert their own views
CREATE POLICY "Users can record their own views" 
ON public.post_views 
FOR INSERT 
WITH CHECK (auth.uid() = viewer_id OR viewer_id IS NULL);

-- Create function to update post views count
CREATE OR REPLACE FUNCTION public.update_post_views_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET views_count = views_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET views_count = views_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to automatically update views count
CREATE TRIGGER update_post_views_count_trigger
  AFTER INSERT OR DELETE ON public.post_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_views_count();

-- Add trending_score column to posts for efficient trending queries
ALTER TABLE public.posts ADD COLUMN trending_score NUMERIC DEFAULT 0;

-- Create function to calculate trending score
CREATE OR REPLACE FUNCTION public.calculate_trending_score(
  views_count INTEGER,
  likes_count INTEGER,
  retweets_count INTEGER,
  replies_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  age_hours NUMERIC;
  engagement_score NUMERIC;
  time_decay NUMERIC;
BEGIN
  -- Calculate age in hours
  age_hours := EXTRACT(EPOCH FROM (now() - created_at)) / 3600;
  
  -- Calculate engagement score (weighted)
  engagement_score := (views_count * 0.1) + (likes_count * 2) + (retweets_count * 3) + (replies_count * 1.5);
  
  -- Apply time decay (posts lose relevance over time)
  time_decay := 1.0 / (1.0 + (age_hours / 24.0));
  
  RETURN engagement_score * time_decay;
END;
$$;

-- Create function to update trending scores for all posts
CREATE OR REPLACE FUNCTION public.update_trending_scores()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.posts 
  SET trending_score = calculate_trending_score(
    COALESCE(views_count, 0),
    COALESCE(likes_count, 0),
    COALESCE(retweets_count, 0),
    COALESCE(replies_count, 0),
    created_at
  );
END;
$$;

-- Update existing posts to have views_count = 0 and calculate initial trending scores
UPDATE public.posts SET views_count = 0 WHERE views_count IS NULL;
SELECT public.update_trending_scores();

-- Enable realtime for post_views
ALTER TABLE public.post_views REPLICA IDENTITY FULL;

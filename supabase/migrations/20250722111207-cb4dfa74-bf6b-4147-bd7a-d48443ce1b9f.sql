-- Create community discussions table
CREATE TABLE public.community_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.community_discussions ENABLE ROW LEVEL SECURITY;

-- Create policies for community discussions
CREATE POLICY "Anyone can view community discussions" 
ON public.community_discussions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own discussions" 
ON public.community_discussions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions" 
ON public.community_discussions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions" 
ON public.community_discussions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create community discussion replies table
CREATE TABLE public.community_discussion_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.community_discussion_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for discussion replies
CREATE POLICY "Anyone can view discussion replies" 
ON public.community_discussion_replies 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own replies" 
ON public.community_discussion_replies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" 
ON public.community_discussion_replies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" 
ON public.community_discussion_replies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create community discussion likes table
CREATE TABLE public.community_discussion_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(discussion_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.community_discussion_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for discussion likes
CREATE POLICY "Anyone can view discussion likes" 
ON public.community_discussion_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own likes" 
ON public.community_discussion_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.community_discussion_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update discussion likes count
CREATE OR REPLACE FUNCTION public.update_discussion_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_discussions 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.discussion_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_discussions 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.discussion_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create function to update discussion replies count
CREATE OR REPLACE FUNCTION public.update_discussion_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_discussions 
    SET replies_count = replies_count + 1 
    WHERE id = NEW.discussion_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_discussions 
    SET replies_count = replies_count - 1 
    WHERE id = OLD.discussion_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic count updates
CREATE TRIGGER update_discussion_likes_count_trigger
  AFTER INSERT OR DELETE ON public.community_discussion_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_discussion_likes_count();

CREATE TRIGGER update_discussion_replies_count_trigger
  AFTER INSERT OR DELETE ON public.community_discussion_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_discussion_replies_count();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_discussion_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON public.community_discussions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_discussion_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at
  BEFORE UPDATE ON public.community_discussion_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_discussion_updated_at_column();
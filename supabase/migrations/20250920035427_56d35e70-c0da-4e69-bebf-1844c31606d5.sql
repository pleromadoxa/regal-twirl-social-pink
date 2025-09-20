-- Create user_blocks table for blocking functionality
CREATE TABLE public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Create user_mutes table for muting functionality  
CREATE TABLE public.user_mutes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  muter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muted_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(muter_id, muted_id)
);

-- Create post_polls table for poll functionality
CREATE TABLE public.post_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  votes_count INTEGER NOT NULL DEFAULT 0,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_votes table for tracking user votes
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.post_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Create events table for social events
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN NOT NULL DEFAULT false,
  max_attendees INTEGER,
  attendees_count INTEGER NOT NULL DEFAULT 0,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_attendees table for tracking attendees
CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_blocks
CREATE POLICY "Users can view their own blocks" ON public.user_blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can create blocks" ON public.user_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can delete their own blocks" ON public.user_blocks FOR DELETE USING (auth.uid() = blocker_id);

-- RLS Policies for user_mutes
CREATE POLICY "Users can view their own mutes" ON public.user_mutes FOR SELECT USING (auth.uid() = muter_id);
CREATE POLICY "Users can create mutes" ON public.user_mutes FOR INSERT WITH CHECK (auth.uid() = muter_id);
CREATE POLICY "Users can delete their own mutes" ON public.user_mutes FOR DELETE USING (auth.uid() = muter_id);

-- RLS Policies for post_polls
CREATE POLICY "Users can view all polls" ON public.post_polls FOR SELECT USING (true);
CREATE POLICY "Users can create polls for their posts" ON public.post_polls FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
);

-- RLS Policies for poll_votes
CREATE POLICY "Users can view all poll votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on polls" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON public.poll_votes FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for events
CREATE POLICY "Users can view all events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own events" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own events" ON public.events FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for event_attendees
CREATE POLICY "Users can view all event attendees" ON public.event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON public.event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own attendance" ON public.event_attendees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove their own attendance" ON public.event_attendees FOR DELETE USING (auth.uid() = user_id);

-- Functions and triggers for poll votes count
CREATE OR REPLACE FUNCTION public.update_poll_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.post_polls 
    SET votes_count = votes_count + 1 
    WHERE id = NEW.poll_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.post_polls 
    SET votes_count = votes_count - 1 
    WHERE id = OLD.poll_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_poll_votes_count_trigger
  AFTER INSERT OR DELETE ON public.poll_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_poll_votes_count();

-- Functions and triggers for event attendees count
CREATE OR REPLACE FUNCTION public.update_event_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events 
    SET attendees_count = attendees_count + 1 
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events 
    SET attendees_count = attendees_count - 1 
    WHERE id = OLD.event_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_attendees_count_trigger
  AFTER INSERT OR DELETE ON public.event_attendees
  FOR EACH ROW EXECUTE FUNCTION public.update_event_attendees_count();

-- Add indexes for performance
CREATE INDEX idx_user_blocks_blocker_id ON public.user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked_id ON public.user_blocks(blocked_id);
CREATE INDEX idx_user_mutes_muter_id ON public.user_mutes(muter_id);
CREATE INDEX idx_user_mutes_muted_id ON public.user_mutes(muted_id);
CREATE INDEX idx_post_polls_post_id ON public.post_polls(post_id);
CREATE INDEX idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user_id ON public.poll_votes(user_id);
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_starts_at ON public.events(starts_at);
CREATE INDEX idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON public.event_attendees(user_id);
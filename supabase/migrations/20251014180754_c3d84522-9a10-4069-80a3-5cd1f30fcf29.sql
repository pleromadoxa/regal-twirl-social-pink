-- Create circle events table
CREATE TABLE IF NOT EXISTS public.circle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.user_circles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN DEFAULT false,
  event_link TEXT,
  max_attendees INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create circle event attendees
CREATE TABLE IF NOT EXISTS public.circle_event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.circle_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'going', 'maybe', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create circle files table
CREATE TABLE IF NOT EXISTS public.circle_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.user_circles(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create circle polls table
CREATE TABLE IF NOT EXISTS public.circle_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.user_circles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  ends_at TIMESTAMP WITH TIME ZONE,
  allow_multiple BOOLEAN DEFAULT false,
  anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create circle poll votes
CREATE TABLE IF NOT EXISTS public.circle_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.circle_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id, option_index)
);

-- Create circle announcements table
CREATE TABLE IF NOT EXISTS public.circle_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.user_circles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.circle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for circle_events
CREATE POLICY "Circle members can view events"
  ON public.circle_events FOR SELECT
  USING (is_circle_member(circle_id, auth.uid()));

CREATE POLICY "Circle members can create events"
  ON public.circle_events FOR INSERT
  WITH CHECK (is_circle_member(circle_id, auth.uid()) AND auth.uid() = creator_id);

CREATE POLICY "Event creators and admins can update events"
  ON public.circle_events FOR UPDATE
  USING (
    auth.uid() = creator_id OR 
    EXISTS (
      SELECT 1 FROM public.circle_members 
      WHERE circle_id = circle_events.circle_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Event creators and admins can delete events"
  ON public.circle_events FOR DELETE
  USING (
    auth.uid() = creator_id OR 
    EXISTS (
      SELECT 1 FROM public.circle_members 
      WHERE circle_id = circle_events.circle_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for circle_event_attendees
CREATE POLICY "Circle members can view attendees"
  ON public.circle_event_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_events ce
      WHERE ce.id = event_id AND is_circle_member(ce.circle_id, auth.uid())
    )
  );

CREATE POLICY "Users can manage their own attendance"
  ON public.circle_event_attendees FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for circle_files
CREATE POLICY "Circle members can view files"
  ON public.circle_files FOR SELECT
  USING (is_circle_member(circle_id, auth.uid()));

CREATE POLICY "Circle members can upload files"
  ON public.circle_files FOR INSERT
  WITH CHECK (is_circle_member(circle_id, auth.uid()) AND auth.uid() = uploader_id);

CREATE POLICY "File uploaders and admins can delete files"
  ON public.circle_files FOR DELETE
  USING (
    auth.uid() = uploader_id OR 
    EXISTS (
      SELECT 1 FROM public.circle_members 
      WHERE circle_id = circle_files.circle_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for circle_polls
CREATE POLICY "Circle members can view polls"
  ON public.circle_polls FOR SELECT
  USING (is_circle_member(circle_id, auth.uid()));

CREATE POLICY "Circle members can create polls"
  ON public.circle_polls FOR INSERT
  WITH CHECK (is_circle_member(circle_id, auth.uid()) AND auth.uid() = creator_id);

CREATE POLICY "Poll creators and admins can manage polls"
  ON public.circle_polls FOR ALL
  USING (
    auth.uid() = creator_id OR 
    EXISTS (
      SELECT 1 FROM public.circle_members 
      WHERE circle_id = circle_polls.circle_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for circle_poll_votes
CREATE POLICY "Circle members can view votes"
  ON public.circle_poll_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_polls cp
      WHERE cp.id = poll_id AND is_circle_member(cp.circle_id, auth.uid())
    )
  );

CREATE POLICY "Users can manage their own votes"
  ON public.circle_poll_votes FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for circle_announcements
CREATE POLICY "Circle members can view announcements"
  ON public.circle_announcements FOR SELECT
  USING (is_circle_member(circle_id, auth.uid()));

CREATE POLICY "Circle admins can manage announcements"
  ON public.circle_announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_members 
      WHERE circle_id = circle_announcements.circle_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    ) AND auth.uid() = creator_id
  );
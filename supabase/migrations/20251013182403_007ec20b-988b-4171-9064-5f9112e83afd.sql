-- Add more robust features to circles

-- Add privacy and category columns to user_circles
ALTER TABLE public.user_circles
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{"notifications": true, "allow_invites": true}'::jsonb,
ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Create circle_members roles
ALTER TABLE public.circle_members
ADD COLUMN IF NOT EXISTS role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
ADD COLUMN IF NOT EXISTS joined_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id);

-- Create circle_posts table for circle-specific content
CREATE TABLE IF NOT EXISTS public.circle_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.user_circles(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  content text NOT NULL,
  media_urls jsonb DEFAULT '[]'::jsonb,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create circle_post_likes table
CREATE TABLE IF NOT EXISTS public.circle_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.circle_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create circle_post_comments table
CREATE TABLE IF NOT EXISTS public.circle_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.circle_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create circle_invitations table
CREATE TABLE IF NOT EXISTS public.circle_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.user_circles(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL,
  invitee_id uuid NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message text,
  created_at timestamp with time zone DEFAULT now(),
  responded_at timestamp with time zone,
  UNIQUE(circle_id, invitee_id)
);

-- Create circle_calls table (independent from regular calls)
CREATE TABLE IF NOT EXISTS public.circle_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.user_circles(id) ON DELETE CASCADE,
  caller_id uuid NOT NULL,
  room_id text NOT NULL UNIQUE,
  call_type text NOT NULL DEFAULT 'audio' CHECK (call_type IN ('audio', 'video')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  participants jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  duration_seconds integer DEFAULT 0
);

-- Enable RLS on all new tables
ALTER TABLE public.circle_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_calls ENABLE ROW LEVEL SECURITY;

-- RLS Policies for circle_posts
CREATE POLICY "Circle members can view posts"
ON public.circle_posts FOR SELECT
USING (public.is_circle_member(circle_id, auth.uid()));

CREATE POLICY "Circle members can create posts"
ON public.circle_posts FOR INSERT
WITH CHECK (
  public.is_circle_member(circle_id, auth.uid()) AND
  auth.uid() = author_id
);

CREATE POLICY "Authors can update their posts"
ON public.circle_posts FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their posts"
ON public.circle_posts FOR DELETE
USING (auth.uid() = author_id);

-- RLS Policies for circle_post_likes
CREATE POLICY "Circle members can view likes"
ON public.circle_post_likes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.circle_posts cp
  WHERE cp.id = circle_post_likes.post_id
  AND public.is_circle_member(cp.circle_id, auth.uid())
));

CREATE POLICY "Circle members can like posts"
ON public.circle_post_likes FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.circle_posts cp
    WHERE cp.id = circle_post_likes.post_id
    AND public.is_circle_member(cp.circle_id, auth.uid())
  )
);

CREATE POLICY "Users can remove their likes"
ON public.circle_post_likes FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for circle_post_comments
CREATE POLICY "Circle members can view comments"
ON public.circle_post_comments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.circle_posts cp
  WHERE cp.id = circle_post_comments.post_id
  AND public.is_circle_member(cp.circle_id, auth.uid())
));

CREATE POLICY "Circle members can create comments"
ON public.circle_post_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.circle_posts cp
    WHERE cp.id = circle_post_comments.post_id
    AND public.is_circle_member(cp.circle_id, auth.uid())
  )
);

CREATE POLICY "Authors can update their comments"
ON public.circle_post_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete their comments"
ON public.circle_post_comments FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for circle_invitations
CREATE POLICY "Users can view their invitations"
ON public.circle_invitations FOR SELECT
USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);

CREATE POLICY "Circle admins can send invitations"
ON public.circle_invitations FOR INSERT
WITH CHECK (
  auth.uid() = inviter_id AND
  EXISTS (
    SELECT 1 FROM public.circle_members cm
    WHERE cm.circle_id = circle_invitations.circle_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Invitees can update their invitations"
ON public.circle_invitations FOR UPDATE
USING (auth.uid() = invitee_id);

-- RLS Policies for circle_calls
CREATE POLICY "Circle members can view calls"
ON public.circle_calls FOR SELECT
USING (public.is_circle_member(circle_id, auth.uid()));

CREATE POLICY "Circle members can create calls"
ON public.circle_calls FOR INSERT
WITH CHECK (
  public.is_circle_member(circle_id, auth.uid()) AND
  auth.uid() = caller_id
);

CREATE POLICY "Participants can update calls"
ON public.circle_calls FOR UPDATE
USING (
  public.is_circle_member(circle_id, auth.uid()) AND
  (caller_id = auth.uid() OR participants ? (auth.uid())::text)
);

-- Create function to update circle post likes count
CREATE OR REPLACE FUNCTION public.update_circle_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.circle_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.circle_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for circle post likes
DROP TRIGGER IF EXISTS update_circle_post_likes_count_trigger ON public.circle_post_likes;
CREATE TRIGGER update_circle_post_likes_count_trigger
AFTER INSERT OR DELETE ON public.circle_post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_circle_post_likes_count();

-- Create function to update circle post comments count
CREATE OR REPLACE FUNCTION public.update_circle_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.circle_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.circle_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for circle post comments
DROP TRIGGER IF EXISTS update_circle_post_comments_count_trigger ON public.circle_post_comments;
CREATE TRIGGER update_circle_post_comments_count_trigger
AFTER INSERT OR DELETE ON public.circle_post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_circle_post_comments_count();

-- Create function to handle invitation acceptance
CREATE OR REPLACE FUNCTION public.handle_circle_invitation_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Add user to circle
    INSERT INTO public.circle_members (circle_id, user_id, role, invited_by)
    VALUES (NEW.circle_id, NEW.invitee_id, 'member', NEW.inviter_id)
    ON CONFLICT (circle_id, user_id) DO NOTHING;
    
    NEW.responded_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invitation acceptance
DROP TRIGGER IF EXISTS handle_circle_invitation_acceptance_trigger ON public.circle_invitations;
CREATE TRIGGER handle_circle_invitation_acceptance_trigger
BEFORE UPDATE ON public.circle_invitations
FOR EACH ROW EXECUTE FUNCTION public.handle_circle_invitation_acceptance();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_circle_posts_circle_id ON public.circle_posts(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_posts_author_id ON public.circle_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_circle_post_likes_post_id ON public.circle_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_circle_post_comments_post_id ON public.circle_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_circle_invitations_invitee_id ON public.circle_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_circle_calls_circle_id ON public.circle_calls(circle_id);
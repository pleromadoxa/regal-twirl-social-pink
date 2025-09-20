-- Create post_collaborators table for collaborative posts
CREATE TABLE public.post_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'collaborator' CHECK (role IN ('creator', 'collaborator', 'contributor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create collaboration_invites table for managing invitations
CREATE TABLE public.collaboration_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, invitee_id)
);

-- Create collaborative_drafts table for draft posts being worked on together
CREATE TABLE public.collaborative_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collaborators JSONB NOT NULL DEFAULT '[]',
  draft_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'ready', 'published')),
  published_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.post_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborative_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_collaborators
CREATE POLICY "Users can view collaborators of their posts" ON public.post_collaborators FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Post creators can manage collaborators" ON public.post_collaborators FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
);

CREATE POLICY "Users can update their own collaboration status" ON public.post_collaborators FOR UPDATE USING (
  user_id = auth.uid()
);

CREATE POLICY "Post creators can remove collaborators" ON public.post_collaborators FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
  OR user_id = auth.uid()
);

-- RLS Policies for collaboration_invites
CREATE POLICY "Users can view their sent and received invites" ON public.collaboration_invites FOR SELECT USING (
  inviter_id = auth.uid() OR invitee_id = auth.uid()
);

CREATE POLICY "Users can create collaboration invites" ON public.collaboration_invites FOR INSERT WITH CHECK (
  inviter_id = auth.uid()
);

CREATE POLICY "Invitees can update their invites" ON public.collaboration_invites FOR UPDATE USING (
  invitee_id = auth.uid() OR inviter_id = auth.uid()
);

CREATE POLICY "Users can cancel their own invites" ON public.collaboration_invites FOR DELETE USING (
  inviter_id = auth.uid()
);

-- RLS Policies for collaborative_drafts
CREATE POLICY "Users can view drafts they created or are collaborating on" ON public.collaborative_drafts FOR SELECT USING (
  creator_id = auth.uid() 
  OR collaborators ? (auth.uid())::text
);

CREATE POLICY "Users can create collaborative drafts" ON public.collaborative_drafts FOR INSERT WITH CHECK (
  creator_id = auth.uid()
);

CREATE POLICY "Creators and collaborators can update drafts" ON public.collaborative_drafts FOR UPDATE USING (
  creator_id = auth.uid() 
  OR collaborators ? (auth.uid())::text
);

CREATE POLICY "Creators can delete their drafts" ON public.collaborative_drafts FOR DELETE USING (
  creator_id = auth.uid()
);

-- Functions for collaboration notifications
CREATE OR REPLACE FUNCTION public.handle_collaboration_invite_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Create notification for collaboration invite
    INSERT INTO public.notifications (user_id, type, actor_id, message, data)
    VALUES (
      NEW.invitee_id,
      'collaboration_invite',
      NEW.inviter_id,
      'invited you to collaborate on a post',
      jsonb_build_object(
        'post_id', NEW.post_id,
        'invite_id', NEW.id,
        'message', NEW.message
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status != 'pending' THEN
    -- Create notification for collaboration response
    INSERT INTO public.notifications (user_id, type, actor_id, message, data)
    VALUES (
      NEW.inviter_id,
      'collaboration_response',
      NEW.invitee_id,
      CASE 
        WHEN NEW.status = 'accepted' THEN 'accepted your collaboration invite'
        WHEN NEW.status = 'declined' THEN 'declined your collaboration invite'
        ELSE 'responded to your collaboration invite'
      END,
      jsonb_build_object(
        'post_id', NEW.post_id,
        'invite_id', NEW.id,
        'status', NEW.status
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collaboration_invite_notification_trigger
  AFTER INSERT OR UPDATE ON public.collaboration_invites
  FOR EACH ROW EXECUTE FUNCTION public.handle_collaboration_invite_notification();

-- Function to automatically add collaborator when invite is accepted
CREATE OR REPLACE FUNCTION public.handle_collaboration_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    -- Add user as collaborator when they accept
    INSERT INTO public.post_collaborators (post_id, user_id, role, status, invited_by)
    VALUES (NEW.post_id, NEW.invitee_id, 'collaborator', 'accepted', NEW.inviter_id)
    ON CONFLICT (post_id, user_id) DO UPDATE SET
      status = 'accepted',
      responded_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collaboration_acceptance_trigger
  AFTER UPDATE ON public.collaboration_invites
  FOR EACH ROW EXECUTE FUNCTION public.handle_collaboration_acceptance();

-- Add indexes for performance
CREATE INDEX idx_post_collaborators_post_id ON public.post_collaborators(post_id);
CREATE INDEX idx_post_collaborators_user_id ON public.post_collaborators(user_id);
CREATE INDEX idx_post_collaborators_status ON public.post_collaborators(status);
CREATE INDEX idx_collaboration_invites_invitee_id ON public.collaboration_invites(invitee_id);
CREATE INDEX idx_collaboration_invites_inviter_id ON public.collaboration_invites(inviter_id);
CREATE INDEX idx_collaboration_invites_status ON public.collaboration_invites(status);
CREATE INDEX idx_collaboration_invites_expires_at ON public.collaboration_invites(expires_at);
CREATE INDEX idx_collaborative_drafts_creator_id ON public.collaborative_drafts(creator_id);
CREATE INDEX idx_collaborative_drafts_status ON public.collaborative_drafts(status);
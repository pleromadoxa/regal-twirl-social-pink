-- Enhanced Privacy Settings Tables

-- Add privacy columns to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS post_visibility TEXT DEFAULT 'public' CHECK (post_visibility IN ('public', 'followers', 'circles', 'private')),
ADD COLUMN IF NOT EXISTS who_can_comment TEXT DEFAULT 'everyone' CHECK (who_can_comment IN ('everyone', 'followers', 'circles', 'nobody')),
ADD COLUMN IF NOT EXISTS who_can_message TEXT DEFAULT 'everyone' CHECK (who_can_message IN ('everyone', 'followers', 'circles', 'nobody')),
ADD COLUMN IF NOT EXISTS who_can_tag TEXT DEFAULT 'everyone' CHECK (who_can_tag IN ('everyone', 'followers', 'circles', 'nobody')),
ADD COLUMN IF NOT EXISTS show_followers_list BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_following_list BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS read_receipts_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS story_replies_enabled BOOLEAN DEFAULT true;

-- Blocked Users Table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, blocked_user_id)
);

-- Muted Users Table
CREATE TABLE IF NOT EXISTS public.muted_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  muted_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mute_duration TEXT DEFAULT 'permanent',
  muted_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, muted_user_id)
);

-- Social Circles Table (like Google+ Circles)
CREATE TABLE IF NOT EXISTS public.user_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'users',
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Circle Members
CREATE TABLE IF NOT EXISTS public.circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.user_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

-- Mood Board (Current user status/vibe)
CREATE TABLE IF NOT EXISTS public.user_moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  activity TEXT,
  music_track TEXT,
  color_theme TEXT DEFAULT '#6366f1',
  emoji TEXT,
  custom_message TEXT,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Social Challenges
CREATE TABLE IF NOT EXISTS public.social_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('fitness', 'creativity', 'learning', 'wellness', 'social', 'other')),
  goal_type TEXT NOT NULL CHECK (goal_type IN ('count', 'duration', 'completion')),
  goal_value INTEGER,
  duration_days INTEGER DEFAULT 7,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  participants_count INTEGER DEFAULT 0,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Challenge Participants
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.social_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(challenge_id, user_id)
);

-- Time Capsules
CREATE TABLE IF NOT EXISTS public.time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]',
  reveal_date TIMESTAMPTZ NOT NULL,
  recipients JSONB DEFAULT '[]',
  is_revealed BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'recipients', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revealed_at TIMESTAMPTZ
);

-- Friendship Milestones
CREATE TABLE IF NOT EXISTS public.friendship_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('anniversary', 'first_message', 'first_call', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  reminder_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id, milestone_type, date)
);

-- Close Friends List
CREATE TABLE IF NOT EXISTS public.close_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muted_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendship_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.close_friends ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_users
CREATE POLICY "Users can manage their own blocks" ON public.blocked_users
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for muted_users
CREATE POLICY "Users can manage their own mutes" ON public.muted_users
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_circles
CREATE POLICY "Users can manage their own circles" ON public.user_circles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view circles they're members of" ON public.user_circles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.circle_members 
      WHERE circle_id = user_circles.id AND user_id = auth.uid()
    )
  );

-- RLS Policies for circle_members
CREATE POLICY "Circle owners can manage members" ON public.circle_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_circles 
      WHERE id = circle_members.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view circles they're in" ON public.circle_members
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for user_moods
CREATE POLICY "Users can manage their own mood" ON public.user_moods
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view moods" ON public.user_moods
  FOR SELECT USING (true);

-- RLS Policies for social_challenges
CREATE POLICY "Anyone can view public challenges" ON public.social_challenges
  FOR SELECT USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can create challenges" ON public.social_challenges
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their challenges" ON public.social_challenges
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their challenges" ON public.social_challenges
  FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for challenge_participants
CREATE POLICY "Users can manage their challenge participation" ON public.challenge_participants
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view challenge participants" ON public.challenge_participants
  FOR SELECT USING (true);

-- RLS Policies for time_capsules
CREATE POLICY "Users can manage their own capsules" ON public.time_capsules
  FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Recipients can view revealed capsules" ON public.time_capsules
  FOR SELECT USING (
    is_revealed = true AND (
      visibility = 'public' OR
      creator_id = auth.uid() OR
      recipients ? (auth.uid())::text
    )
  );

-- RLS Policies for friendship_milestones
CREATE POLICY "Users can manage milestones with friends" ON public.friendship_milestones
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for close_friends
CREATE POLICY "Users can manage their close friends list" ON public.close_friends
  FOR ALL USING (auth.uid() = user_id);

-- Functions to update counters
CREATE OR REPLACE FUNCTION update_circle_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_circles 
    SET member_count = member_count + 1 
    WHERE id = NEW.circle_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_circles 
    SET member_count = member_count - 1 
    WHERE id = OLD.circle_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_challenge_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_challenges 
    SET participants_count = participants_count + 1 
    WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_challenges 
    SET participants_count = participants_count - 1 
    WHERE id = OLD.challenge_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER circle_member_count_trigger
  AFTER INSERT OR DELETE ON public.circle_members
  FOR EACH ROW EXECUTE FUNCTION update_circle_member_count();

CREATE TRIGGER challenge_participants_count_trigger
  AFTER INSERT OR DELETE ON public.challenge_participants
  FOR EACH ROW EXECUTE FUNCTION update_challenge_participants_count();

-- Indexes for performance
CREATE INDEX idx_blocked_users_user_id ON public.blocked_users(user_id);
CREATE INDEX idx_blocked_users_blocked_user_id ON public.blocked_users(blocked_user_id);
CREATE INDEX idx_muted_users_user_id ON public.muted_users(user_id);
CREATE INDEX idx_user_circles_user_id ON public.user_circles(user_id);
CREATE INDEX idx_circle_members_circle_id ON public.circle_members(circle_id);
CREATE INDEX idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX idx_user_moods_user_id ON public.user_moods(user_id);
CREATE INDEX idx_social_challenges_creator_id ON public.social_challenges(creator_id);
CREATE INDEX idx_social_challenges_category ON public.social_challenges(category);
CREATE INDEX idx_challenge_participants_challenge_id ON public.challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user_id ON public.challenge_participants(user_id);
CREATE INDEX idx_time_capsules_creator_id ON public.time_capsules(creator_id);
CREATE INDEX idx_time_capsules_reveal_date ON public.time_capsules(reveal_date);
CREATE INDEX idx_friendship_milestones_user_id ON public.friendship_milestones(user_id);
CREATE INDEX idx_friendship_milestones_friend_id ON public.friendship_milestones(friend_id);
CREATE INDEX idx_close_friends_user_id ON public.close_friends(user_id);
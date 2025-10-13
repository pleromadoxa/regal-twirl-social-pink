-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role::text = _role
  )
$$;

-- Challenge analytics table
CREATE TABLE IF NOT EXISTS public.challenge_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.social_challenges(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views_count INTEGER DEFAULT 0,
  joins_count INTEGER DEFAULT 0,
  completions_count INTEGER DEFAULT 0,
  abandons_count INTEGER DEFAULT 0,
  average_progress DECIMAL(5,2) DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(challenge_id, date)
);

ALTER TABLE public.challenge_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Challenge creators and admins can view analytics" ON public.challenge_analytics;
DROP POLICY IF EXISTS "System can insert analytics" ON public.challenge_analytics;
DROP POLICY IF EXISTS "System can update analytics" ON public.challenge_analytics;

-- Analytics policies
CREATE POLICY "Challenge creators and admins can view analytics"
  ON public.challenge_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.social_challenges sc
      WHERE sc.id = challenge_analytics.challenge_id 
        AND (sc.creator_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "System can insert analytics"
  ON public.challenge_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update analytics"
  ON public.challenge_analytics FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_challenge_analytics_challenge_date ON public.challenge_analytics(challenge_id, date);
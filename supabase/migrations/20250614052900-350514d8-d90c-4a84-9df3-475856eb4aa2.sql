
-- Create sponsored_posts table to track boosted/promoted posts
CREATE TABLE public.sponsored_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  business_page_id UUID REFERENCES public.business_pages(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES public.business_ads(id) ON DELETE CASCADE,
  sponsor_type TEXT NOT NULL CHECK (sponsor_type IN ('boosted_post', 'ad_post')),
  budget_amount NUMERIC NOT NULL DEFAULT 0,
  budget_currency TEXT NOT NULL DEFAULT 'USD',
  target_audience JSONB DEFAULT '{}',
  duration_days INTEGER NOT NULL DEFAULT 7,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spent_amount NUMERIC DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for sponsored_posts
ALTER TABLE public.sponsored_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sponsored posts" 
ON public.sponsored_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Business owners can manage their sponsored posts" 
ON public.sponsored_posts 
FOR ALL 
USING (
  business_page_id IN (
    SELECT id FROM public.business_pages WHERE owner_id = auth.uid()
  )
);

-- Create function to automatically set end date
CREATE OR REPLACE FUNCTION public.update_sponsored_post_end_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.ends_at = NEW.starts_at + (NEW.duration_days || ' days')::interval;
  RETURN NEW;
END;
$$;

-- Create trigger for sponsored posts
CREATE TRIGGER update_sponsored_post_end_date_trigger
  BEFORE INSERT OR UPDATE ON public.sponsored_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sponsored_post_end_date();

-- Add sponsored_post_id to posts table to link posts to sponsorships
ALTER TABLE public.posts ADD COLUMN sponsored_post_id UUID REFERENCES public.sponsored_posts(id) ON DELETE SET NULL;

-- Enable realtime for sponsored_posts
ALTER TABLE public.sponsored_posts REPLICA IDENTITY FULL;

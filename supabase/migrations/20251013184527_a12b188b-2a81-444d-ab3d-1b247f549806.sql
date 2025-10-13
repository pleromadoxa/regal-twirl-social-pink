-- Create circle_post_replies table for threaded comments
CREATE TABLE IF NOT EXISTS public.circle_post_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.circle_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.circle_post_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for circle_post_replies
CREATE POLICY "Circle members can view replies"
ON circle_post_replies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM circle_posts cp
    WHERE cp.id = circle_post_replies.post_id
    AND is_circle_member(cp.circle_id, auth.uid())
  )
);

CREATE POLICY "Circle members can create replies"
ON circle_post_replies
FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND EXISTS (
    SELECT 1 FROM circle_posts cp
    WHERE cp.id = circle_post_replies.post_id
    AND is_circle_member(cp.circle_id, auth.uid())
  )
);

CREATE POLICY "Authors can update their replies"
ON circle_post_replies
FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their replies"
ON circle_post_replies
FOR DELETE
USING (auth.uid() = author_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_circle_post_replies_post_id ON circle_post_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_circle_post_replies_created_at ON circle_post_replies(created_at);

-- Add replies_count column to circle_posts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'circle_posts' AND column_name = 'replies_count'
  ) THEN
    ALTER TABLE public.circle_posts ADD COLUMN replies_count INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Function to update replies count
CREATE OR REPLACE FUNCTION public.update_circle_post_replies_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.circle_posts 
    SET replies_count = replies_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.circle_posts 
    SET replies_count = replies_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update replies count
DROP TRIGGER IF EXISTS update_circle_post_replies_count_trigger ON circle_post_replies;
CREATE TRIGGER update_circle_post_replies_count_trigger
AFTER INSERT OR DELETE ON circle_post_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_circle_post_replies_count();
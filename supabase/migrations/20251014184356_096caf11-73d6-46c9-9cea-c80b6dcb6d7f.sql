-- Add quoted_post_id column to posts table for quote tweets
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS quoted_post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_quoted_post_id ON public.posts(quoted_post_id);

-- Update the posts count trigger to handle quote tweets
CREATE OR REPLACE FUNCTION public.update_post_quotes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.quoted_post_id IS NOT NULL THEN
    UPDATE public.posts 
    SET retweets_count = retweets_count + 1 
    WHERE id = NEW.quoted_post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.quoted_post_id IS NOT NULL THEN
    UPDATE public.posts 
    SET retweets_count = retweets_count - 1 
    WHERE id = OLD.quoted_post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for quote tweets
DROP TRIGGER IF EXISTS handle_post_quotes_count ON public.posts;
CREATE TRIGGER handle_post_quotes_count
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_quotes_count();

-- Create notification function for quote tweets
CREATE OR REPLACE FUNCTION public.handle_quote_tweet_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  quoted_post_owner_id UUID;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.quoted_post_id IS NOT NULL THEN
    -- Get the quoted post owner
    SELECT user_id INTO quoted_post_owner_id 
    FROM public.posts 
    WHERE id = NEW.quoted_post_id;
    
    -- Create notification
    PERFORM create_notification(
      quoted_post_owner_id,
      'quote_tweet',
      NEW.user_id,
      NEW.id,
      'quoted your post'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for quote tweet notifications
DROP TRIGGER IF EXISTS handle_quote_tweet_notification_trigger ON public.posts;
CREATE TRIGGER handle_quote_tweet_notification_trigger
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_quote_tweet_notification();
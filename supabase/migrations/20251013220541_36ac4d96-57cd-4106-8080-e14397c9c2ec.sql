-- Drop the existing trigger first, then function
DROP TRIGGER IF EXISTS challenge_participants_count_trigger ON public.challenge_participants;
DROP TRIGGER IF EXISTS update_participants_count_trigger ON public.challenge_participants;
DROP FUNCTION IF EXISTS update_challenge_participants_count() CASCADE;

-- Recreate the function with correct logic
CREATE OR REPLACE FUNCTION public.update_challenge_participants_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_challenges 
    SET participants_count = participants_count + 1 
    WHERE id = NEW.challenge_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_challenges 
    SET participants_count = GREATEST(0, participants_count - 1)
    WHERE id = OLD.challenge_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'abandoned' THEN
    UPDATE public.social_challenges 
    SET participants_count = GREATEST(0, participants_count - 1)
    WHERE id = NEW.challenge_id;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER update_participants_count_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_participants_count();

-- Fix existing participant counts (sync them with actual data)
UPDATE public.social_challenges sc
SET participants_count = (
  SELECT COUNT(*)
  FROM public.challenge_participants cp
  WHERE cp.challenge_id = sc.id AND cp.status = 'active'
);
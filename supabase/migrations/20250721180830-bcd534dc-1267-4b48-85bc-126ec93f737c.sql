-- Fix personal account followers and following counts

-- Update followers_count to match actual follows
UPDATE profiles 
SET followers_count = (
  SELECT COALESCE(COUNT(*), 0) 
  FROM follows 
  WHERE follows.following_id = profiles.id
);

-- Update following_count to match actual follows  
UPDATE profiles 
SET following_count = (
  SELECT COALESCE(COUNT(*), 0) 
  FROM follows 
  WHERE follows.follower_id = profiles.id
);

-- Ensure the trigger exists for the follows table
DROP TRIGGER IF EXISTS update_follow_counts_trigger ON follows;

CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();
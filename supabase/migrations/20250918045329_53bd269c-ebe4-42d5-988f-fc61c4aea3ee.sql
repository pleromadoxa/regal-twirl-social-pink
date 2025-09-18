-- Drop the existing function and recreate with proper parameter names
DROP FUNCTION IF EXISTS update_user_presence(UUID, BOOLEAN);

-- Create the function with non-ambiguous parameter names  
CREATE OR REPLACE FUNCTION update_user_presence(p_user_id UUID, p_is_online BOOLEAN)
RETURNS void AS $$
BEGIN
  -- Use UPSERT to insert or update user presence
  INSERT INTO public.user_presence (user_id, is_online, last_seen, updated_at)
  VALUES (p_user_id, p_is_online, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_online = EXCLUDED.is_online,
    last_seen = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
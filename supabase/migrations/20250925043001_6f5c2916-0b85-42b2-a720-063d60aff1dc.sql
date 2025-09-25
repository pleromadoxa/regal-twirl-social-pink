-- Drop and recreate the trigger function with simpler logic
DROP TRIGGER IF EXISTS missed_call_notification_trigger ON active_calls;
DROP FUNCTION IF EXISTS create_missed_call_notification() CASCADE;

-- Create a simpler missed call notification function that doesn't loop through participants
CREATE OR REPLACE FUNCTION public.create_missed_call_notification()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  caller_profile_name text;
BEGIN
  -- Only create notification for ended calls with no answer (duration = 0)
  IF NEW.status = 'ended' AND OLD.status = 'active' AND (NEW.ended_at - NEW.created_at) < INTERVAL '10 seconds' THEN
    -- Get caller's display name
    SELECT COALESCE(display_name, username, 'Unknown User') 
    INTO caller_profile_name
    FROM public.profiles 
    WHERE id = NEW.caller_id;
    
    -- For now, skip creating notifications to avoid the array parsing issue
    -- This will be handled at the application level instead
    NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger (but it won't do anything for now)
CREATE TRIGGER missed_call_notification_trigger 
  AFTER UPDATE ON active_calls 
  FOR EACH ROW 
  EXECUTE FUNCTION create_missed_call_notification();

-- Now apply the RLS policies properly
-- Enable RLS on active_calls table if not already enabled
ALTER TABLE active_calls ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view calls they participate in" ON active_calls;
DROP POLICY IF EXISTS "Users can create calls" ON active_calls;
DROP POLICY IF EXISTS "Participants can update calls" ON active_calls;

-- Create RLS policies for active_calls with proper type casting
CREATE POLICY "Users can view calls they participate in" ON active_calls
  FOR SELECT USING (
    caller_id = auth.uid() OR 
    (participants ? (auth.uid())::text)
  );

CREATE POLICY "Users can create calls" ON active_calls
  FOR INSERT WITH CHECK (caller_id = auth.uid());

CREATE POLICY "Participants can update calls" ON active_calls
  FOR UPDATE USING (
    caller_id = auth.uid() OR 
    (participants ? (auth.uid())::text)
  );

-- Ensure realtime is enabled for active_calls
ALTER PUBLICATION supabase_realtime ADD TABLE active_calls;
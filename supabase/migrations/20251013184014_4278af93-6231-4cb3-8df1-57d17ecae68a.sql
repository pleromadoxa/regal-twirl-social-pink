-- Fix RLS policies for circle_calls table

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Circle members can create calls" ON circle_calls;
DROP POLICY IF EXISTS "Circle members can view calls" ON circle_calls;
DROP POLICY IF EXISTS "Circle members can update calls" ON circle_calls;

-- Allow circle members to create calls
CREATE POLICY "Circle members can create calls"
ON circle_calls
FOR INSERT
WITH CHECK (
  auth.uid() = caller_id
  AND EXISTS (
    SELECT 1 FROM circle_members
    WHERE circle_id = circle_calls.circle_id
    AND user_id = auth.uid()
  )
);

-- Allow circle members to view calls for their circles
CREATE POLICY "Circle members can view calls"
ON circle_calls
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM circle_members
    WHERE circle_id = circle_calls.circle_id
    AND user_id = auth.uid()
  )
);

-- Allow caller to update their calls
CREATE POLICY "Callers can update their calls"
ON circle_calls
FOR UPDATE
USING (auth.uid() = caller_id);
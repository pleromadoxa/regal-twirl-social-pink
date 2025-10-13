-- Fix infinite recursion in user_circles RLS policies
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view circles they are members of" ON public.user_circles;
DROP POLICY IF EXISTS "Users can update their own circles" ON public.user_circles;
DROP POLICY IF EXISTS "Users can delete their own circles" ON public.user_circles;
DROP POLICY IF EXISTS "Users can create circles" ON public.user_circles;

-- Create new policies without potential recursion

-- SELECT: Users can view circles they are members of OR circles they created
CREATE POLICY "circle_select_policy" ON public.user_circles
FOR SELECT
USING (
  -- User is the creator
  (user_id = auth.uid())
  OR
  -- User is a member (using the security definer function)
  is_circle_member(id, auth.uid())
);

-- INSERT: Only allow creating circles where user_id matches auth.uid()
CREATE POLICY "circle_insert_policy" ON public.user_circles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- UPDATE: Only creators can update their circles
CREATE POLICY "circle_update_policy" ON public.user_circles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Only creators can delete their circles
CREATE POLICY "circle_delete_policy" ON public.user_circles
FOR DELETE
USING (user_id = auth.uid());
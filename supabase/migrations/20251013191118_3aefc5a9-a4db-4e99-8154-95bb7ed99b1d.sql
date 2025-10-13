-- Add RLS policies for user_circles to allow members to view circles they belong to
DROP POLICY IF EXISTS "Users can view circles they created" ON public.user_circles;
DROP POLICY IF EXISTS "Users can view circles they are members of" ON public.user_circles;

-- Policy: Users can view circles where they are members
CREATE POLICY "Users can view circles they are members of"
ON public.user_circles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.circle_members
    WHERE circle_members.circle_id = user_circles.id
      AND circle_members.user_id = auth.uid()
  )
);

-- Policy: Circle creators can update their circles
CREATE POLICY "Circle creators can update circles"
ON public.user_circles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Circle creators can delete their circles
CREATE POLICY "Circle creators can delete circles"
ON public.user_circles
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Policy: Authenticated users can create circles
CREATE POLICY "Users can create circles"
ON public.user_circles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
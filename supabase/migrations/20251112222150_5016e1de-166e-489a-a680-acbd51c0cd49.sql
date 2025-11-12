
-- Drop the problematic policy
DROP POLICY IF EXISTS "circle_members_insert_policy" ON public.circle_members;

-- Create security definer function to check if user can add members
CREATE OR REPLACE FUNCTION public.can_add_circle_members(_circle_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM circle_members cm
    WHERE cm.circle_id = _circle_id
      AND cm.user_id = _user_id
      AND (cm.role = 'admin' OR cm.can_add_members = true)
  ) OR EXISTS (
    SELECT 1
    FROM user_circles uc
    WHERE uc.id = _circle_id
      AND uc.user_id = _user_id
  );
$$;

-- Create new policy using the security definer function
CREATE POLICY "Members with permission can add others"
ON public.circle_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_add_circle_members(circle_id, auth.uid())
);

-- Also ensure circle members can view other members
CREATE POLICY "Circle members can view all members" 
ON public.circle_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM user_circles uc 
    WHERE uc.id = circle_members.circle_id 
    AND uc.user_id = auth.uid()
  )
  OR user_id = auth.uid()
);

-- Allow admins and circle owners to update member permissions
CREATE POLICY "Admins can update member permissions"
ON public.circle_members
FOR UPDATE
TO authenticated
USING (
  public.can_add_circle_members(circle_id, auth.uid())
);

-- Allow admins and circle owners to remove members
CREATE POLICY "Admins can remove members"
ON public.circle_members
FOR DELETE
TO authenticated
USING (
  public.can_add_circle_members(circle_id, auth.uid())
  OR user_id = auth.uid()
);

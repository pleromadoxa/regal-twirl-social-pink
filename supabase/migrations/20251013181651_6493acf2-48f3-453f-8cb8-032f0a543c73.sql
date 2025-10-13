-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view circles they're members of" ON public.user_circles;

-- Create a security definer function to check circle membership
-- This prevents infinite recursion by bypassing RLS
CREATE OR REPLACE FUNCTION public.is_circle_member(_circle_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.circle_members
    WHERE circle_id = _circle_id
      AND user_id = _user_id
  )
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Users can view circles they're members of"
ON public.user_circles
FOR SELECT
USING (
  public.is_circle_member(id, auth.uid())
);

-- Also ensure the main policy for circle owners is correct
DROP POLICY IF EXISTS "Users can manage their own circles" ON public.user_circles;

CREATE POLICY "Users can manage their own circles"
ON public.user_circles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
-- Add permission controls to circle members
ALTER TABLE public.circle_members 
ADD COLUMN IF NOT EXISTS can_add_members BOOLEAN DEFAULT false;

-- Update RLS policies for circle_posts to allow edit/delete
DROP POLICY IF EXISTS "Circle members can create posts" ON public.circle_posts;
DROP POLICY IF EXISTS "Circle members can view posts" ON public.circle_posts;

-- Circle members can view posts
CREATE POLICY "circle_posts_select_policy" ON public.circle_posts
FOR SELECT
USING (
  is_circle_member(circle_id, auth.uid())
);

-- Circle members can create posts
CREATE POLICY "circle_posts_insert_policy" ON public.circle_posts
FOR INSERT
WITH CHECK (
  is_circle_member(circle_id, auth.uid()) AND
  auth.uid() = author_id
);

-- Authors can update their own posts
CREATE POLICY "circle_posts_update_policy" ON public.circle_posts
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own posts
CREATE POLICY "circle_posts_delete_policy" ON public.circle_posts
FOR DELETE
USING (auth.uid() = author_id);

-- Update circle_members RLS to control who can add members
DROP POLICY IF EXISTS "Circle members can add members" ON public.circle_members;

-- Only admins or members with can_add_members permission can add members
CREATE POLICY "circle_members_insert_policy" ON public.circle_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.circle_members cm
    WHERE cm.circle_id = circle_members.circle_id
      AND cm.user_id = auth.uid()
      AND (cm.role = 'admin' OR cm.can_add_members = true)
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_circle_members_can_add_members ON public.circle_members(circle_id, can_add_members) WHERE can_add_members = true;
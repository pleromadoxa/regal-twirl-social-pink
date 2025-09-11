-- Clean up all conflicting policies and create simple working ones
DROP POLICY IF EXISTS "Admins can manage all memberships" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can delete their own membership" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can view all group members" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can view group members of groups they belong to" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.group_conversation_members;
DROP POLICY IF EXISTS "add_group_members_as_creator" ON public.group_conversation_members;
DROP POLICY IF EXISTS "delete_group_members_v2" ON public.group_conversation_members;
DROP POLICY IF EXISTS "group_members_delete_policy" ON public.group_conversation_members;
DROP POLICY IF EXISTS "group_members_insert_creator_policy" ON public.group_conversation_members;
DROP POLICY IF EXISTS "group_members_insert_self_policy" ON public.group_conversation_members;
DROP POLICY IF EXISTS "group_members_select_policy" ON public.group_conversation_members;
DROP POLICY IF EXISTS "insert_group_members_v2" ON public.group_conversation_members;
DROP POLICY IF EXISTS "leave_groups" ON public.group_conversation_members;
DROP POLICY IF EXISTS "manage_group_members_v2" ON public.group_conversation_members;
DROP POLICY IF EXISTS "view_group_members_v2" ON public.group_conversation_members;
DROP POLICY IF EXISTS "view_group_memberships" ON public.group_conversation_members;

-- Drop group_conversations policies
DROP POLICY IF EXISTS "Anyone can view group conversations" ON public.group_conversations;
DROP POLICY IF EXISTS "Creators can update their groups" ON public.group_conversations;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.group_conversations;
DROP POLICY IF EXISTS "Group creators and admins can update groups" ON public.group_conversations;
DROP POLICY IF EXISTS "create_groups" ON public.group_conversations;
DROP POLICY IF EXISTS "view_user_groups" ON public.group_conversations;

-- Create simple, working policies
CREATE POLICY "group_members_simple_select" 
ON public.group_conversation_members 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "group_members_simple_insert" 
ON public.group_conversation_members 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "group_members_creator_insert" 
ON public.group_conversation_members 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.group_conversations 
    WHERE id = group_id AND created_by = auth.uid()
  )
);

CREATE POLICY "group_members_simple_delete" 
ON public.group_conversation_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- Group conversations policies
CREATE POLICY "group_conversations_simple_select" 
ON public.group_conversations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "group_conversations_simple_insert" 
ON public.group_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "group_conversations_simple_update" 
ON public.group_conversations 
FOR UPDATE 
USING (auth.uid() = created_by);
-- Drop all conflicting policies first
DROP POLICY IF EXISTS "Group creators can add members" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can view their own group memberships" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.group_conversations;
DROP POLICY IF EXISTS "Users can create groups" ON public.group_conversations;

-- Create simple, non-recursive policies
CREATE POLICY "view_group_memberships" 
ON public.group_conversation_members 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "add_group_members_as_creator" 
ON public.group_conversation_members 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_conversations 
    WHERE id = group_id AND created_by = auth.uid()
  )
);

CREATE POLICY "leave_groups" 
ON public.group_conversation_members 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "view_user_groups" 
ON public.group_conversations 
FOR SELECT 
USING (
  created_by = auth.uid() OR 
  id IN (
    SELECT group_id FROM public.group_conversation_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "create_groups" 
ON public.group_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);
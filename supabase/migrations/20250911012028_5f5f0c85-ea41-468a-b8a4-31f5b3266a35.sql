-- Fix group conversation policies by removing circular dependencies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own group memberships" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can insert their own membership when invited" ON public.group_conversation_members;

-- Create simplified policies without circular references
CREATE POLICY "Users can view their own group memberships" 
ON public.group_conversation_members 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Group creators can add members" 
ON public.group_conversation_members 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_conversations 
    WHERE id = group_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can leave groups" 
ON public.group_conversation_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix group conversations policies
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.group_conversations;

CREATE POLICY "Users can view groups they are members of" 
ON public.group_conversations 
FOR SELECT 
USING (
  created_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.group_conversation_members 
    WHERE group_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups" 
ON public.group_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);
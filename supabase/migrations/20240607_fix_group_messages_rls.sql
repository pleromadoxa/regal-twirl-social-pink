
-- Drop existing problematic RLS policies for group_messages
DROP POLICY IF EXISTS "Users can view messages in groups they belong to" ON public.group_messages;
DROP POLICY IF EXISTS "Users can insert messages in groups they belong to" ON public.group_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.group_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.group_messages;

-- Enable RLS on group_messages if not already enabled
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies for group_messages using the security definer functions
CREATE POLICY "Users can view messages in groups they belong to" 
ON public.group_messages 
FOR SELECT 
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Group members can send messages" 
ON public.group_messages 
FOR INSERT 
WITH CHECK (
  public.is_group_member(group_id, auth.uid()) AND 
  sender_id = auth.uid()
);

CREATE POLICY "Users can update their own messages" 
ON public.group_messages 
FOR UPDATE 
USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages or admins can delete any" 
ON public.group_messages 
FOR DELETE 
USING (
  sender_id = auth.uid() OR 
  public.is_group_admin(group_id, auth.uid())
);

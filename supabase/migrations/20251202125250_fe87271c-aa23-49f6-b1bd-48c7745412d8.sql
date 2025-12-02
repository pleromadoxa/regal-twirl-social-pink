-- Add DELETE policy for conversations table so users can delete their own conversations
CREATE POLICY "Users can delete their own conversations" 
ON public.conversations 
FOR DELETE 
USING ((auth.uid() = participant_1) OR (auth.uid() = participant_2));
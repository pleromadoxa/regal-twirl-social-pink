-- Add message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Add message replies functionality
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS reply_to_message_id UUID,
ADD COLUMN IF NOT EXISTS forwarded_from_message_id UUID,
ADD COLUMN IF NOT EXISTS forwarded_from_user_id UUID,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(20) DEFAULT 'sent';

-- Add enhanced user presence (skip if exists)
CREATE TABLE IF NOT EXISTS public.enhanced_user_presence (
  user_id UUID PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'offline',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_typing_in_conversation UUID,
  typing_started_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add conversation settings for disappearing messages
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS disappearing_messages_duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS archived_by_participant_1 BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_by_participant_2 BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS muted_by_participant_1 BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS muted_by_participant_2 BOOLEAN DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_user_presence ENABLE ROW LEVEL SECURITY;

-- Create policies for message reactions
CREATE POLICY "Users can view reactions on messages they can access" 
ON public.message_reactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.messages m 
    WHERE m.id = message_id 
    AND (m.sender_id = auth.uid() OR m.recipient_id = auth.uid())
  )
);

CREATE POLICY "Users can add reactions to accessible messages" 
ON public.message_reactions FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.messages m 
    WHERE m.id = message_id 
    AND (m.sender_id = auth.uid() OR m.recipient_id = auth.uid())
  )
);

CREATE POLICY "Users can remove their own reactions" 
ON public.message_reactions FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for enhanced user presence
CREATE POLICY "Anyone can view enhanced user presence" 
ON public.enhanced_user_presence FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own enhanced presence" 
ON public.enhanced_user_presence FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enhanced presence" 
ON public.enhanced_user_presence FOR UPDATE 
USING (auth.uid() = user_id);

-- Add realtime functionality
ALTER publication supabase_realtime ADD TABLE public.message_reactions;
ALTER publication supabase_realtime ADD TABLE public.enhanced_user_presence;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.enhanced_user_presence REPLICA IDENTITY FULL;

-- Function to automatically delete expired messages
CREATE OR REPLACE FUNCTION delete_expired_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM public.messages 
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON public.messages(reply_to_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON public.messages(expires_at);
CREATE INDEX IF NOT EXISTS idx_enhanced_user_presence_status ON public.enhanced_user_presence(status);
CREATE INDEX IF NOT EXISTS idx_conversations_archived ON public.conversations(archived_by_participant_1, archived_by_participant_2);
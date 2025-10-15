-- Create circle messages table
CREATE TABLE IF NOT EXISTS public.circle_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL REFERENCES public.user_circles(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.circle_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for circle messages
CREATE POLICY "Circle members can view messages"
  ON public.circle_messages
  FOR SELECT
  USING (is_circle_member(circle_id, auth.uid()));

CREATE POLICY "Circle members can send messages"
  ON public.circle_messages
  FOR INSERT
  WITH CHECK (
    is_circle_member(circle_id, auth.uid()) AND
    auth.uid() = sender_id
  );

CREATE POLICY "Users can delete their own messages"
  ON public.circle_messages
  FOR DELETE
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
  ON public.circle_messages
  FOR UPDATE
  USING (auth.uid() = sender_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_circle_messages_circle_id ON public.circle_messages(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_messages_created_at ON public.circle_messages(created_at DESC);

-- Enable realtime for circle_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_messages;
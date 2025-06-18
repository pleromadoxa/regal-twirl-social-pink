
-- Create ai_chat_history table for storing AI chat conversations
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message text NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    session_id text,
    rating text CHECK (rating IN ('up', 'down')),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own chat history" ON public.ai_chat_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" ON public.ai_chat_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages" ON public.ai_chat_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS ai_chat_history_user_id_idx ON public.ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS ai_chat_history_session_id_idx ON public.ai_chat_history(session_id);

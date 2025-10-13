-- Create circle call history table
CREATE TABLE IF NOT EXISTS public.circle_call_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.user_circles(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL,
  call_type TEXT NOT NULL DEFAULT 'audio',
  participants UUID[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.circle_call_history ENABLE ROW LEVEL SECURITY;

-- Circle members can view call history of their circles
CREATE POLICY "circle_call_history_select_policy" ON public.circle_call_history
FOR SELECT
USING (
  is_circle_member(circle_id, auth.uid())
);

-- Callers can create call history
CREATE POLICY "circle_call_history_insert_policy" ON public.circle_call_history
FOR INSERT
WITH CHECK (auth.uid() = caller_id);

-- Callers and participants can update call history (for ending calls)
CREATE POLICY "circle_call_history_update_policy" ON public.circle_call_history
FOR UPDATE
USING (
  (auth.uid() = caller_id) OR 
  (auth.uid() = ANY(participants))
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_circle_call_history_circle_id ON public.circle_call_history(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_call_history_caller_id ON public.circle_call_history(caller_id);
CREATE INDEX IF NOT EXISTS idx_circle_call_history_started_at ON public.circle_call_history(started_at DESC);

-- Update circle_calls table to link to call history
ALTER TABLE public.circle_calls 
ADD COLUMN IF NOT EXISTS call_history_id UUID REFERENCES public.circle_call_history(id);
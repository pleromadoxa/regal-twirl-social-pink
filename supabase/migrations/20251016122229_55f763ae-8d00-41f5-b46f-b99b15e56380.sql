-- Add reply_to_id column to circle_messages if it doesn't exist
ALTER TABLE public.circle_messages 
ADD COLUMN IF NOT EXISTS reply_to_id uuid REFERENCES public.circle_messages(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_circle_messages_reply_to ON public.circle_messages(reply_to_id);

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS public.circle_typing_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.user_circles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

-- Enable RLS
ALTER TABLE public.circle_typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS policies for typing indicators
CREATE POLICY "Circle members can view typing indicators"
ON public.circle_typing_indicators
FOR SELECT
TO authenticated
USING (is_circle_member(circle_id, auth.uid()));

CREATE POLICY "Users can manage their typing status"
ON public.circle_typing_indicators
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for typing indicators
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_typing_indicators;

-- Create function to clean up old typing indicators
CREATE OR REPLACE FUNCTION public.cleanup_old_typing_indicators()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.circle_typing_indicators
  WHERE updated_at < now() - INTERVAL '10 seconds';
END;
$$;
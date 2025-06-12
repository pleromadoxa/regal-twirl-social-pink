
-- Create game_scores table for storing user high scores
CREATE TABLE public.game_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_saves table for storing game progress
CREATE TABLE public.game_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  save_data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for game_scores
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own game scores" 
  ON public.game_scores 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game scores" 
  ON public.game_scores 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game scores" 
  ON public.game_scores 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game scores" 
  ON public.game_scores 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for game_saves
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own game saves" 
  ON public.game_saves 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game saves" 
  ON public.game_saves 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game saves" 
  ON public.game_saves 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game saves" 
  ON public.game_saves 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate saves per game type per user
ALTER TABLE public.game_saves 
ADD CONSTRAINT unique_user_game_save 
UNIQUE (user_id, game_type);

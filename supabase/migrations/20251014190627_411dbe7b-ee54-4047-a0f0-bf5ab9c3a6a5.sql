-- Add metadata column to posts table for storing additional data like mood boards
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
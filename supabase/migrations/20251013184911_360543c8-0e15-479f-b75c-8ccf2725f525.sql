-- Create storage bucket for circle images
INSERT INTO storage.buckets (id, name, public)
VALUES ('circle-images', 'circle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for circle images
CREATE POLICY "Circle members can view circle images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'circle-images'
  AND (
    -- Public images
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM user_circles WHERE is_private = false
    )
    OR
    -- Private circle images - only members can see
    (storage.foldername(name))[1] IN (
      SELECT circle_id::text FROM circle_members WHERE user_id = auth.uid()
    )
    OR
    -- Circle owners can see their circle images
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM user_circles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Circle owners can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'circle-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_circles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Circle owners can update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'circle-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_circles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Circle owners can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'circle-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_circles WHERE user_id = auth.uid()
  )
);

-- Update user_circles table to add more settings
ALTER TABLE public.user_circles 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS allow_posts BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_calls BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS require_approval BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'members_only' CHECK (visibility IN ('public', 'members_only', 'private'));

-- Add permissions column to circle_members
ALTER TABLE public.circle_members
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{
    "can_post": true,
    "can_invite": false,
    "can_manage_posts": false,
    "can_start_calls": true
  }'::jsonb;

-- Update RLS policies for circle posts to respect permissions
DROP POLICY IF EXISTS "Circle members can create posts" ON circle_posts;
CREATE POLICY "Circle members can create posts"
ON circle_posts
FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND EXISTS (
    SELECT 1 FROM user_circles uc
    LEFT JOIN circle_members cm ON cm.circle_id = uc.id AND cm.user_id = auth.uid()
    WHERE uc.id = circle_posts.circle_id
    AND uc.allow_posts = true
    AND (
      -- Circle owner can always post
      uc.user_id = auth.uid()
      OR
      -- Members with permission can post
      (cm.permissions->>'can_post')::boolean = true
    )
  )
);

-- Update RLS policies for circle calls to respect permissions
DROP POLICY IF EXISTS "Circle members can create calls" ON circle_calls;
CREATE POLICY "Circle members can create calls"
ON circle_calls
FOR INSERT
WITH CHECK (
  auth.uid() = caller_id
  AND EXISTS (
    SELECT 1 FROM user_circles uc
    LEFT JOIN circle_members cm ON cm.circle_id = uc.id AND cm.user_id = auth.uid()
    WHERE uc.id = circle_calls.circle_id
    AND uc.allow_calls = true
    AND (
      -- Circle owner can always start calls
      uc.user_id = auth.uid()
      OR
      -- Members with permission can start calls
      (cm.permissions->>'can_start_calls')::boolean = true
    )
  )
);
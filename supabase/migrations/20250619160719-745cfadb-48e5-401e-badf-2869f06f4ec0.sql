
-- Create storage bucket for post audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-audio', 'post-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for post-audio bucket
CREATE POLICY "Users can upload their own audio files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'post-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Audio files are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'post-audio');

CREATE POLICY "Users can update their own audio files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'post-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'post-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

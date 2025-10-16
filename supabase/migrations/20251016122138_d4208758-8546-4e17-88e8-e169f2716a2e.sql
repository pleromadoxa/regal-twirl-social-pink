-- Create storage bucket for circle images and files
INSERT INTO storage.buckets (id, name, public)
VALUES ('circle-images', 'circle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for circle images
CREATE POLICY "Circle members can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'circle-images' AND
  EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE circle_id::text = (storage.foldername(name))[1]
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Circle members can view files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'circle-images' AND
  EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE circle_id::text = (storage.foldername(name))[1]
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'circle-images' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
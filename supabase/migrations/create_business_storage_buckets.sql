
-- Create storage buckets for business images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('business-avatars', 'business-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('business-banners', 'business-banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create policies for business avatars bucket
CREATE POLICY "Public can view business avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'business-avatars');

CREATE POLICY "Authenticated users can upload business avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'business-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own business avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'business-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own business avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'business-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for business banners bucket
CREATE POLICY "Public can view business banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'business-banners');

CREATE POLICY "Authenticated users can upload business banners" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'business-banners' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own business banners" ON storage.objects
  FOR UPDATE USING (bucket_id = 'business-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own business banners" ON storage.objects
  FOR DELETE USING (bucket_id = 'business-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

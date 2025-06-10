
-- Create storage buckets for audio posts and other media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('post-audio', 'post-audio', true, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/webm']),
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('ad-assets', 'ad-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the buckets
CREATE POLICY "Allow authenticated users to upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-audio');

CREATE POLICY "Allow public access to audio files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-audio');

CREATE POLICY "Allow users to delete their audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public access to product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Allow users to delete their product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow authenticated users to upload ad assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ad-assets');

CREATE POLICY "Allow public access to ad assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ad-assets');

-- Add shop settings to business pages
ALTER TABLE business_pages 
ADD COLUMN IF NOT EXISTS shop_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS shop_status text DEFAULT 'open',
ADD COLUMN IF NOT EXISTS featured_products jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS shop_settings jsonb DEFAULT '{}'::jsonb;

-- Create ads table for business promotion
CREATE TABLE IF NOT EXISTS business_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_page_id uuid REFERENCES business_pages(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  budget_amount numeric NOT NULL,
  budget_currency text DEFAULT 'USD',
  duration_days integer NOT NULL,
  target_countries text[] DEFAULT '{}',
  target_regions text[] DEFAULT '{}',
  ad_type text NOT NULL CHECK (ad_type IN ('page_boost', 'product_boost', 'service_boost', 'offer_boost')),
  target_product_id uuid,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'rejected')),
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  spent_amount numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  starts_at timestamp with time zone DEFAULT now(),
  ends_at timestamp with time zone
);

-- Create trigger function to update ends_at when inserting/updating ads
CREATE OR REPLACE FUNCTION update_ad_end_date()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.ends_at = NEW.starts_at + (NEW.duration_days || ' days')::interval;
  RETURN NEW;
END;
$function$;

-- Create trigger for updating ad end dates
DROP TRIGGER IF EXISTS update_ad_end_date_trigger ON business_ads;
CREATE TRIGGER update_ad_end_date_trigger
  BEFORE INSERT OR UPDATE ON business_ads
  FOR EACH ROW EXECUTE FUNCTION update_ad_end_date();

-- Create ad analytics table
CREATE TABLE IF NOT EXISTS ad_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES business_ads(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  spent_amount numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Create business services table for non-ecommerce businesses
CREATE TABLE IF NOT EXISTS business_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_page_id uuid REFERENCES business_pages(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric,
  currency text DEFAULT 'USD',
  duration_minutes integer,
  category text,
  is_active boolean DEFAULT true,
  booking_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create business bookings table
CREATE TABLE IF NOT EXISTS business_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_page_id uuid REFERENCES business_pages(id) ON DELETE CASCADE,
  service_id uuid REFERENCES business_services(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  booking_date timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL,
  total_amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for new tables
ALTER TABLE business_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_bookings ENABLE ROW LEVEL SECURITY;

-- Business ads policies
CREATE POLICY "Business owners can manage their ads"
ON business_ads FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM business_pages 
    WHERE id = business_ads.business_page_id 
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Public can view active ads"
ON business_ads FOR SELECT
TO public
USING (status = 'active');

-- Ad analytics policies
CREATE POLICY "Business owners can view their ad analytics"
ON ad_analytics FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM business_ads ba
    JOIN business_pages bp ON ba.business_page_id = bp.id
    WHERE ba.id = ad_analytics.ad_id 
    AND bp.owner_id = auth.uid()
  )
);

-- Business services policies
CREATE POLICY "Business owners can manage their services"
ON business_services FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM business_pages 
    WHERE id = business_services.business_page_id 
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Public can view active services"
ON business_services FOR SELECT
TO public
USING (is_active = true);

-- Business bookings policies
CREATE POLICY "Business owners and customers can view relevant bookings"
ON business_bookings FOR SELECT
TO authenticated
USING (
  customer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM business_pages 
    WHERE id = business_bookings.business_page_id 
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create bookings"
ON business_bookings FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Business owners can update bookings"
ON business_bookings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM business_pages 
    WHERE id = business_bookings.business_page_id 
    AND owner_id = auth.uid()
  )
);

-- Update posts table to include audio_url if not exists
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS audio_url text;

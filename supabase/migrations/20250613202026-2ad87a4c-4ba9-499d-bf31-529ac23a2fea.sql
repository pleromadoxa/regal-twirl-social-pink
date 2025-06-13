
-- Add verification fields to profiles table for better verification management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_level text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verification_notes text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verified_by uuid DEFAULT NULL;

-- Create index for better performance on verification queries
CREATE INDEX IF NOT EXISTS idx_profiles_verification_level ON public.profiles(verification_level);

-- Ensure business_pages table has separate image fields (they should already exist but let's make sure)
ALTER TABLE public.business_pages 
ADD COLUMN IF NOT EXISTS page_avatar_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS page_banner_url text DEFAULT NULL;

-- Update existing business pages to use separate image fields if they don't have them
UPDATE public.business_pages 
SET page_avatar_url = avatar_url 
WHERE page_avatar_url IS NULL AND avatar_url IS NOT NULL;

UPDATE public.business_pages 
SET page_banner_url = banner_url 
WHERE page_banner_url IS NULL AND banner_url IS NOT NULL;

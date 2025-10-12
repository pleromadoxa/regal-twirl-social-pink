-- Add business_page_id column to stories table
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS business_page_id UUID REFERENCES public.business_pages(id) ON DELETE CASCADE;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_stories_business_page_id ON public.stories(business_page_id);
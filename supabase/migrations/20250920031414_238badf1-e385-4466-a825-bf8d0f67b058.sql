-- Add delete functionality for posts
-- Users should only be able to delete their own posts
CREATE POLICY "Users can delete their own posts" ON public.posts
FOR DELETE USING (auth.uid() = user_id);

-- Add URL generation for business pages
-- Create a function to generate business page URLs
CREATE OR REPLACE FUNCTION get_business_page_url(page_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  page_name text;
  page_username text;
BEGIN
  SELECT name, LOWER(REPLACE(name, ' ', '-')) INTO page_name, page_username
  FROM business_pages 
  WHERE id = page_id;
  
  IF page_name IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Return a clean URL-friendly version
  RETURN '/business/' || page_username || '/' || page_id;
END;
$$;
-- Fix the security issue by adding search_path to the function
CREATE OR REPLACE FUNCTION get_business_page_url(page_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  page_name text;
  page_username text;
BEGIN
  SELECT page_name, LOWER(REPLACE(page_name, ' ', '-')) INTO page_name, page_username
  FROM business_pages 
  WHERE id = page_id;
  
  IF page_name IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Return a clean URL-friendly version
  RETURN '/business/' || page_username || '/' || page_id;
END;
$$;
-- Check and fix the business page followers count trigger

-- First, let's manually update the followers count to match actual follows
UPDATE business_pages 
SET followers_count = (
  SELECT COALESCE(COUNT(*), 0) 
  FROM business_page_follows 
  WHERE business_page_follows.page_id = business_pages.id
);

-- Create the trigger for business_page_follows if it doesn't exist
DROP TRIGGER IF EXISTS update_business_page_followers_count_trigger ON business_page_follows;

CREATE TRIGGER update_business_page_followers_count_trigger
  AFTER INSERT OR DELETE ON business_page_follows
  FOR EACH ROW EXECUTE FUNCTION update_business_page_followers_count();
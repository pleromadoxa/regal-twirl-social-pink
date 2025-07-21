-- Create business_ads table for advertisement management
CREATE TABLE IF NOT EXISTS public.business_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_page_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ad_type TEXT NOT NULL DEFAULT 'page_boost',
  budget_amount NUMERIC NOT NULL DEFAULT 0,
  budget_currency TEXT NOT NULL DEFAULT 'USD',
  duration_days INTEGER NOT NULL DEFAULT 7,
  target_countries TEXT[] DEFAULT '{}',
  target_regions TEXT[] DEFAULT '{}',
  target_product_id UUID,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spent_amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_products table for e-commerce
CREATE TABLE IF NOT EXISTS public.business_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_page_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  sku TEXT,
  stock_quantity INTEGER DEFAULT 0,
  category TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  discount_percentage NUMERIC DEFAULT 0,
  discount_start_date DATE,
  discount_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping_cart table for customer shopping carts
CREATE TABLE IF NOT EXISTS public.shopping_cart (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.business_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_cart ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_ads
CREATE POLICY "Business owners can manage their ads" 
ON public.business_ads 
FOR ALL 
USING (business_page_id IN (
  SELECT id FROM business_pages WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can view active ads" 
ON public.business_ads 
FOR SELECT 
USING (status = 'active');

-- RLS policies for business_products
CREATE POLICY "Business owners can manage their products" 
ON public.business_products 
FOR ALL 
USING (business_page_id IN (
  SELECT id FROM business_pages WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can view active products" 
ON public.business_products 
FOR SELECT 
USING (is_active = true);

-- RLS policies for shopping_cart
CREATE POLICY "Users can manage their own cart" 
ON public.shopping_cart 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger to automatically update end dates for ads
CREATE OR REPLACE FUNCTION public.update_ad_end_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ends_at = NEW.starts_at + (NEW.duration_days || ' days')::interval;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_ad_end_date
  BEFORE INSERT OR UPDATE ON public.business_ads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ad_end_date();

-- Add foreign key constraints
ALTER TABLE public.business_ads 
ADD CONSTRAINT business_ads_business_page_id_fkey 
FOREIGN KEY (business_page_id) REFERENCES public.business_pages(id) ON DELETE CASCADE;

ALTER TABLE public.business_products 
ADD CONSTRAINT business_products_business_page_id_fkey 
FOREIGN KEY (business_page_id) REFERENCES public.business_pages(id) ON DELETE CASCADE;

ALTER TABLE public.shopping_cart 
ADD CONSTRAINT shopping_cart_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.shopping_cart 
ADD CONSTRAINT shopping_cart_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.business_products(id) ON DELETE CASCADE;
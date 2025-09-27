-- Create missing e-commerce tables

-- Product likes table  
CREATE TABLE IF NOT EXISTS public.product_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Product reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  business_page_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User orders table
CREATE TABLE IF NOT EXISTS public.user_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_page_id UUID NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  shipping_amount NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Order status history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.user_orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  comment TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_page_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_page_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC(10,2) NOT NULL,
  minimum_order_amount NUMERIC(10,2) DEFAULT 0,
  maximum_discount_amount NUMERIC(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_likes
CREATE POLICY "Users can view all product likes" 
ON public.product_likes FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own product likes" 
ON public.product_likes FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for wishlists
CREATE POLICY "Users can manage their own wishlist items" 
ON public.wishlists FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for product_reviews
CREATE POLICY "Anyone can view product reviews" 
ON public.product_reviews FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reviews" 
ON public.product_reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.product_reviews FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.product_reviews FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for user_orders
CREATE POLICY "Users can view their own orders" 
ON public.user_orders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.user_orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Business owners can view orders for their business" 
ON public.user_orders FOR SELECT 
USING (business_page_id IN (
  SELECT id FROM public.business_pages WHERE owner_id = auth.uid()
));

CREATE POLICY "Business owners can update orders for their business" 
ON public.user_orders FOR UPDATE 
USING (business_page_id IN (
  SELECT id FROM public.business_pages WHERE owner_id = auth.uid()
));

-- RLS Policies for order_status_history
CREATE POLICY "Users can view order history for their orders" 
ON public.order_status_history FOR SELECT 
USING (order_id IN (
  SELECT id FROM public.user_orders WHERE user_id = auth.uid()
));

CREATE POLICY "Business owners can manage order history for their business orders" 
ON public.order_status_history FOR ALL 
USING (order_id IN (
  SELECT uo.id FROM public.user_orders uo
  JOIN public.business_pages bp ON uo.business_page_id = bp.id
  WHERE bp.owner_id = auth.uid()
));

-- RLS Policies for product_categories
CREATE POLICY "Anyone can view active product categories" 
ON public.product_categories FOR SELECT 
USING (is_active = true);

CREATE POLICY "Business owners can manage their product categories" 
ON public.product_categories FOR ALL 
USING (business_page_id IN (
  SELECT id FROM public.business_pages WHERE owner_id = auth.uid()
));

-- RLS Policies for coupons
CREATE POLICY "Business owners can manage their coupons" 
ON public.coupons FOR ALL 
USING (business_page_id IN (
  SELECT id FROM public.business_pages WHERE owner_id = auth.uid()
));

-- Add rating and review_count columns to business_products if they don't exist
ALTER TABLE public.business_products 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_number TEXT;
BEGIN
  order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to update product ratings
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL;
  review_count INTEGER;
BEGIN
  -- Calculate average rating and review count for the product
  SELECT AVG(rating)::DECIMAL(3,2), COUNT(*) 
  INTO avg_rating, review_count
  FROM public.product_reviews 
  WHERE product_id = COALESCE(NEW.product_id, OLD.product_id);
  
  -- Update the business_products table
  UPDATE public.business_products 
  SET 
    rating = avg_rating,
    review_count = review_count
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_product_rating_on_insert ON public.product_reviews;
DROP TRIGGER IF EXISTS update_product_rating_on_update ON public.product_reviews;
DROP TRIGGER IF EXISTS update_product_rating_on_delete ON public.product_reviews;

-- Create triggers for product rating updates
CREATE TRIGGER update_product_rating_on_insert
  AFTER INSERT ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

CREATE TRIGGER update_product_rating_on_update
  AFTER UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

CREATE TRIGGER update_product_rating_on_delete
  AFTER DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();
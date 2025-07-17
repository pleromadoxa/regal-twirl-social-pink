-- Enable RLS on premium_features table
ALTER TABLE public.premium_features ENABLE ROW LEVEL SECURITY;

-- Create policy for premium_features - make them viewable by everyone since they're feature definitions
CREATE POLICY "Premium features are viewable by everyone" 
ON public.premium_features 
FOR SELECT 
USING (true);

-- Enable RLS on currencies table  
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

-- Create policy for currencies - make them viewable by everyone since they're reference data
CREATE POLICY "Currencies are viewable by everyone" 
ON public.currencies 
FOR SELECT 
USING (true);

-- Create transactions table for real transaction data
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
  subscription_tier TEXT NOT NULL,
  transaction_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create system_settings table for admin configuration
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type TEXT NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'object', 'array')),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on both tables
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for transactions (admin access only)
CREATE POLICY "Admin can view all transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update transactions" ON public.transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for system_settings (admin access only)
CREATE POLICY "Admin can view all system settings" ON public.system_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can insert system settings" ON public.system_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update system settings" ON public.system_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete system settings" ON public.system_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Public can read public system settings
CREATE POLICY "Public can view public system settings" ON public.system_settings
  FOR SELECT USING (is_public = true);

-- Insert some sample transactions for testing
INSERT INTO public.transactions (
  customer_email, 
  amount, 
  currency, 
  status, 
  subscription_tier, 
  transaction_id,
  stripe_payment_intent_id
) VALUES 
  ('user1@example.com', 9.99, 'USD', 'completed', 'Pro', 'txn_' || substr(md5(random()::text), 1, 12), 'pi_' || substr(md5(random()::text), 1, 12)),
  ('user2@example.com', 19.99, 'USD', 'completed', 'Business', 'txn_' || substr(md5(random()::text), 1, 12), 'pi_' || substr(md5(random()::text), 1, 12)),
  ('user3@example.com', 9.99, 'USD', 'pending', 'Pro', 'txn_' || substr(md5(random()::text), 1, 12), 'pi_' || substr(md5(random()::text), 1, 12)),
  ('user4@example.com', 19.99, 'USD', 'failed', 'Business', 'txn_' || substr(md5(random()::text), 1, 12), 'pi_' || substr(md5(random()::text), 1, 12));

-- Insert some default system settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES 
  ('site_name', '"Regal Social"', 'string', 'Main site name', true),
  ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', false),
  ('max_file_size', '10485760', 'number', 'Maximum file upload size in bytes', false),
  ('allowed_file_types', '["jpg", "jpeg", "png", "gif", "mp4", "mov"]', 'array', 'Allowed file types for uploads', false),
  ('subscription_prices', '{"pro": 9.99, "business": 19.99}', 'object', 'Subscription tier prices', true),
  ('features_enabled', '{"ai_studio": true, "business_pages": true, "ads_manager": true}', 'object', 'Feature toggles', false);

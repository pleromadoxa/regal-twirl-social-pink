
-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view all user roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert user roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (false); -- Only allow through admin functions

CREATE POLICY "Only admins can update user roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (false); -- Only allow through admin functions

CREATE POLICY "Only admins can delete user roles" 
  ON public.user_roles 
  FOR DELETE 
  USING (false); -- Only allow through admin functions

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

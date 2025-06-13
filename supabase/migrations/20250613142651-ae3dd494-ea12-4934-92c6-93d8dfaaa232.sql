
-- Create a table for post reports
CREATE TABLE public.post_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  admin_notes TEXT
);

-- Add Row Level Security
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- Allow users to create reports
CREATE POLICY "Users can create post reports" 
  ON public.post_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

-- Allow users to view their own reports
CREATE POLICY "Users can view their own reports" 
  ON public.post_reports 
  FOR SELECT 
  USING (auth.uid() = reporter_id);

-- Allow admins to view and manage all reports (we'll need to implement admin role checking)
CREATE POLICY "Admins can manage all reports" 
  ON public.post_reports 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (
        (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pleromadoxa@gmail.com'
        OR username = 'pleromadoxa'
      )
    )
  );

-- Create index for better performance
CREATE INDEX idx_post_reports_status ON public.post_reports(status);
CREATE INDEX idx_post_reports_post_id ON public.post_reports(post_id);
CREATE INDEX idx_post_reports_created_at ON public.post_reports(created_at DESC);

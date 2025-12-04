-- Add verification columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_level text,
ADD COLUMN IF NOT EXISTS verification_notes text,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verified_by uuid;

-- Add scheduled_posts table for post scheduling feature
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_urls text[] DEFAULT '{}',
  scheduled_at timestamp with time zone NOT NULL,
  published_at timestamp with time zone,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  post_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for scheduled_posts
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for scheduled_posts
CREATE POLICY "Users can manage their own scheduled posts"
ON public.scheduled_posts
FOR ALL
USING (auth.uid() = user_id);

-- Add voice_url column to messages for voice notes
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS voice_url text,
ADD COLUMN IF NOT EXISTS voice_duration integer;

-- Create marketplace_listings table
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  category text,
  condition text CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  images text[] DEFAULT '{}',
  location text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'pending', 'inactive')),
  views_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for marketplace_listings
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- RLS policies for marketplace_listings
CREATE POLICY "Anyone can view active listings"
ON public.marketplace_listings
FOR SELECT
USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Users can manage their own listings"
ON public.marketplace_listings
FOR ALL
USING (auth.uid() = seller_id);

-- Create marketplace_messages table for buyer-seller communication
CREATE TABLE IF NOT EXISTS public.marketplace_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for marketplace_messages
ALTER TABLE public.marketplace_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for marketplace_messages
CREATE POLICY "Users can view their own marketplace messages"
ON public.marketplace_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send marketplace messages"
ON public.marketplace_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
ON public.marketplace_messages
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Create live_streams table
CREATE TABLE IF NOT EXISTS public.live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  streamer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  stream_key text UNIQUE,
  stream_url text,
  thumbnail_url text,
  status text NOT NULL DEFAULT 'offline' CHECK (status IN ('offline', 'live', 'ended')),
  viewer_count integer DEFAULT 0,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for live_streams
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- RLS policies for live_streams
CREATE POLICY "Anyone can view live streams"
ON public.live_streams
FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own streams"
ON public.live_streams
FOR ALL
USING (auth.uid() = streamer_id);
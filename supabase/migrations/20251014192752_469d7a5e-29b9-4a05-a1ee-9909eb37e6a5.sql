-- Add missing notification types to constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
  'missed_call'::text, 
  'message'::text, 
  'follow'::text, 
  'like'::text, 
  'reply'::text,
  'collaboration_invite'::text,
  'collaboration_response'::text,
  'mention'::text,
  'retweet'::text,
  'quote_tweet'::text,
  'streak_warning'::text,
  'streak_lost'::text
]));
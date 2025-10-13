-- Add trigger to automatically add circle creator as a member
CREATE OR REPLACE FUNCTION public.add_creator_to_circle_members()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.circle_members (circle_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'admin')
  ON CONFLICT (circle_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER add_creator_to_circle_members_trigger
AFTER INSERT ON public.user_circles
FOR EACH ROW
EXECUTE FUNCTION public.add_creator_to_circle_members();

-- Update RLS policy to also allow circle owners to create calls
DROP POLICY IF EXISTS "Circle members can create calls" ON circle_calls;

CREATE POLICY "Circle members can create calls"
ON circle_calls
FOR INSERT
WITH CHECK (
  auth.uid() = caller_id
  AND (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = circle_calls.circle_id
      AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_circles
      WHERE id = circle_calls.circle_id
      AND user_id = auth.uid()
    )
  )
);

-- Add the current circle creator as a member (one-time fix for existing circles)
INSERT INTO public.circle_members (circle_id, user_id, role)
SELECT id, user_id, 'admin'
FROM public.user_circles
WHERE NOT EXISTS (
  SELECT 1 FROM circle_members
  WHERE circle_members.circle_id = user_circles.id
  AND circle_members.user_id = user_circles.user_id
)
ON CONFLICT (circle_id, user_id) DO NOTHING;

-- Create security definer function to check room membership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_room_member(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_room_members
    WHERE user_id = _user_id
      AND room_id = _room_id
      AND status = 'approved'
  )
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Approved members can see room members" ON public.chat_room_members;

-- Recreate using security definer function
CREATE POLICY "Approved members can see room members"
ON public.chat_room_members
FOR SELECT
USING (public.is_room_member(auth.uid(), room_id));

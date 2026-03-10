
-- 1. Create RPC to search profiles filtered by role (avoids user_roles RLS issue)
CREATE OR REPLACE FUNCTION public.search_profiles_by_role(search_term text, target_role app_role)
RETURNS TABLE(user_id uuid, full_name text, email text, username text, role app_role)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.user_id, p.full_name, p.email, p.username, ur.role
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON ur.user_id = p.user_id AND ur.role = target_role
  WHERE (p.email ILIKE '%' || search_term || '%' OR p.username ILIKE '%' || search_term || '%' OR p.full_name ILIKE '%' || search_term || '%')
    AND p.user_id != auth.uid()
  LIMIT 10;
$$;

-- 2. Allow approved room members to also invite others (not just the creator)
DROP POLICY IF EXISTS "Room creator can invite members" ON public.chat_room_members;

CREATE POLICY "Room members can invite others"
ON public.chat_room_members
FOR INSERT
TO authenticated
WITH CHECK (
  invited_by = auth.uid()
  AND (
    EXISTS (
      SELECT 1 FROM chat_rooms WHERE chat_rooms.id = chat_room_members.room_id AND chat_rooms.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM chat_room_members existing
      WHERE existing.room_id = chat_room_members.room_id
        AND existing.user_id = auth.uid()
        AND existing.status = 'approved'
    )
  )
);

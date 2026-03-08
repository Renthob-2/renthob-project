-- Create a secure function to search profiles by email/username without exposing full table
CREATE OR REPLACE FUNCTION public.search_profiles_for_invite(search_term text)
RETURNS TABLE(user_id uuid, full_name text, email text, username text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.full_name, p.email, p.username
  FROM public.profiles p
  WHERE (p.email ILIKE '%' || search_term || '%' OR p.username ILIKE '%' || search_term || '%' OR p.full_name ILIKE '%' || search_term || '%')
    AND p.user_id != auth.uid()
  LIMIT 10;
$$;
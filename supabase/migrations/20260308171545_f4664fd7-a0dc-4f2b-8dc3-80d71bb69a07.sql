-- Create a secure function to check username availability
CREATE OR REPLACE FUNCTION public.is_username_taken(check_username text, current_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE username = lower(check_username)
      AND user_id != current_user_id
  );
$$;
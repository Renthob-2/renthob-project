
-- 1. Fix profile SELECT policies: scope from {public} to {authenticated}
DROP POLICY IF EXISTS "Landlords can view applicant profiles" ON public.profiles;
CREATE POLICY "Landlords can view applicant profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id IN (
  SELECT rental_applications.applicant_id
  FROM rental_applications
  WHERE rental_applications.landlord_id = auth.uid()
));

DROP POLICY IF EXISTS "Landlords can view tour requester profiles" ON public.profiles;
CREATE POLICY "Landlords can view tour requester profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id IN (
  SELECT tour_requests.tenant_id
  FROM tour_requests
  WHERE tour_requests.landlord_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can view message participant profiles" ON public.profiles;
CREATE POLICY "Users can view message participant profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id IN (
  SELECT messages.sender_id FROM messages WHERE messages.recipient_id = auth.uid()
  UNION
  SELECT messages.recipient_id FROM messages WHERE messages.sender_id = auth.uid()
));

-- 2. Add explicit auth guard + revoke from anon on profile search functions
REVOKE EXECUTE ON FUNCTION public.search_profiles_for_invite(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.search_profiles_by_role(text, app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.search_profiles_for_invite(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_profiles_by_role(text, app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.search_profiles_for_invite(search_term text)
 RETURNS TABLE(user_id uuid, full_name text, email text, username text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  RETURN QUERY
  SELECT p.user_id, p.full_name, p.email, p.username
  FROM public.profiles p
  WHERE (p.email ILIKE '%' || search_term || '%' OR p.username ILIKE '%' || search_term || '%' OR p.full_name ILIKE '%' || search_term || '%')
    AND p.user_id != auth.uid()
  LIMIT 10;
END;
$function$;

CREATE OR REPLACE FUNCTION public.search_profiles_by_role(search_term text, target_role app_role)
 RETURNS TABLE(user_id uuid, full_name text, email text, username text, role app_role)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  RETURN QUERY
  SELECT p.user_id, p.full_name, p.email, p.username, ur.role
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON ur.user_id = p.user_id AND ur.role = target_role
  WHERE (p.email ILIKE '%' || search_term || '%' OR p.username ILIKE '%' || search_term || '%' OR p.full_name ILIKE '%' || search_term || '%')
    AND p.user_id != auth.uid()
  LIMIT 10;
END;
$function$;

-- 3. Remove client-side notification INSERT policy. Notifications are inserted by SECURITY DEFINER triggers only.
DROP POLICY IF EXISTS "Users can receive notifications" ON public.notifications;

-- 4. Revoke EXECUTE on other internal SECURITY DEFINER helpers from anon
REVOKE EXECUTE ON FUNCTION public.get_affiliate_by_code(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_username_taken(text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_room_member(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_notification_enabled(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.approve_role_request(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.reject_role_request(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.mask_application_field(text, text) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.approve_role_request(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_role_request(uuid, text) TO authenticated;

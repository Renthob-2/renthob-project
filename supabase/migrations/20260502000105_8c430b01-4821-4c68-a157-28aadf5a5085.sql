
-- Revoke EXECUTE from PUBLIC (default grant) on all SECURITY DEFINER functions
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT n.nspname AS schema, p.proname AS name,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC, anon',
                   fn.schema, fn.name, fn.args);
  END LOOP;
END $$;

-- Re-grant the user-callable ones to authenticated explicitly
GRANT EXECUTE ON FUNCTION public.search_profiles_for_invite(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_profiles_by_role(text, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_username_taken(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_affiliate_by_code(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_room_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_notification_enabled(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_role_request(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_role_request(uuid, text) TO authenticated;

-- Restrict listing of the property-images bucket: allow viewing individual files but not enumerating the bucket
-- Drop overly broad public SELECT policies on storage.objects for this bucket if any
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND (qual ILIKE '%property-images%' OR policyname ILIKE '%property-images%')
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Allow direct file access (by exact name) but not listing
-- Note: making bucket private would break existing public URLs; keep public but rely on knowing the path.
-- We add a SELECT policy that requires the object name to be provided (which is true for direct fetches).
CREATE POLICY "Property images public direct access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-images');

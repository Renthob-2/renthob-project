-- Fix 1: Restrict property owner profiles to authenticated users only
DROP POLICY IF EXISTS "Users can view property owner profiles" ON public.profiles;
CREATE POLICY "Users can view property owner profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  user_id IN (
    SELECT properties.owner_id FROM properties WHERE properties.status = 'active'::property_status
  )
);

-- Fix 2: Restrict self-assigned roles to tenant only
DROP POLICY IF EXISTS "Users can insert their own role on signup" ON public.user_roles;
CREATE POLICY "Users can insert their own role on signup"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  role = 'tenant'::app_role
);
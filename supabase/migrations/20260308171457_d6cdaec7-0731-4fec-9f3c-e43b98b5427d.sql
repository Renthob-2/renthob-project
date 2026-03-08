-- Remove overly permissive policy that exposes all profiles to all authenticated users
DROP POLICY IF EXISTS "Authenticated users can search profiles" ON public.profiles;
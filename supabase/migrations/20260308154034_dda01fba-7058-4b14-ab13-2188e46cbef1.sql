-- Fix 1: Restrict user_roles INSERT to prevent admin self-assignment
DROP POLICY IF EXISTS "Users can insert their own role on signup" ON public.user_roles;

CREATE POLICY "Users can insert their own role on signup"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  role IN ('tenant'::app_role, 'landlord'::app_role, 'agent'::app_role)
);

-- Fix 3: Create a function to mask sensitive rental application fields
CREATE OR REPLACE FUNCTION public.mask_application_field(
  field_value text,
  app_status text
)
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN app_status IN ('reviewing', 'approved', 'rejected') THEN field_value
    ELSE NULL
  END;
$$;
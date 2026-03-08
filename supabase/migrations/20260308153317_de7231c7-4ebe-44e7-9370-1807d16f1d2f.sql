
-- Fix storage upload path validation: restrict uploads to user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;

CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix profile visibility: add context-based viewing policies
-- Allow viewing profiles of active property owners
CREATE POLICY "Users can view property owner profiles"
ON public.profiles FOR SELECT
USING (
  user_id IN (
    SELECT owner_id FROM public.properties 
    WHERE status = 'active'
  )
);

-- Allow viewing profiles of message participants
CREATE POLICY "Users can view message participant profiles"
ON public.profiles FOR SELECT
USING (
  user_id IN (
    SELECT sender_id FROM public.messages 
    WHERE recipient_id = auth.uid()
    UNION
    SELECT recipient_id FROM public.messages 
    WHERE sender_id = auth.uid()
  )
);

-- Allow landlords to view applicant profiles
CREATE POLICY "Landlords can view applicant profiles"
ON public.profiles FOR SELECT
USING (
  user_id IN (
    SELECT applicant_id FROM public.rental_applications 
    WHERE landlord_id = auth.uid()
  )
);

-- Allow landlords to view tour requester profiles
CREATE POLICY "Landlords can view tour requester profiles"
ON public.profiles FOR SELECT
USING (
  user_id IN (
    SELECT tenant_id FROM public.tour_requests 
    WHERE landlord_id = auth.uid()
  )
);

-- Add null input validation to has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_id IS NULL OR _role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

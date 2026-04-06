-- Allow users to insert their own affiliate profile (as pending/inactive)
CREATE POLICY "Users can apply for affiliate program"
ON public.affiliate_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND is_active = false
);

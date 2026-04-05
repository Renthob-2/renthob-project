CREATE POLICY "Admins can delete affiliate profiles"
ON public.affiliate_profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin RLS policies for profiles (view all, update all)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin RLS policies for properties (full CRUD)
CREATE POLICY "Admins can view all properties"
ON public.properties FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all properties"
ON public.properties FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all properties"
ON public.properties FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin RLS policies for user_roles (view all, update all, delete)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin RLS policies for id_verifications (view all, update all)
CREATE POLICY "Admins can view all verifications"
ON public.id_verifications FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all verifications"
ON public.id_verifications FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin RLS policies for rental_applications (view all, update all)
CREATE POLICY "Admins can view all applications"
ON public.rental_applications FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all applications"
ON public.rental_applications FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin RLS policies for tour_requests (view all, update all)
CREATE POLICY "Admins can view all tour requests"
ON public.tour_requests FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all tour requests"
ON public.tour_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin RLS policies for messages (view all)
CREATE POLICY "Admins can view all messages"
ON public.messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin RLS policies for tenant_profiles (view all)
CREATE POLICY "Admins can view all tenant profiles"
ON public.tenant_profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Close the remaining client-side privilege and record-integrity gaps.

-- Profiles are private by default. Context-specific policies and RPCs expose
-- only the people a user is legitimately interacting with.
DROP POLICY IF EXISTS "Authenticated users can search profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view property owner profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE OR REPLACE FUNCTION public.is_current_user_active()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid() AND is_suspended = false
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id IS NOT NULL
    AND _role IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.user_roles roles
      JOIN public.profiles profile ON profile.user_id = roles.user_id
      WHERE roles.user_id = _user_id
        AND roles.role = _role
        AND profile.is_suspended = false
    );
$$;

REVOKE ALL ON FUNCTION public.is_current_user_active() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_active() TO authenticated;

-- Suspended accounts retain their records but cannot mutate marketplace data.
CREATE POLICY "Active accounts can update profiles"
ON public.profiles AS RESTRICTIVE FOR UPDATE TO authenticated
USING (public.is_current_user_active())
WITH CHECK (public.is_current_user_active());

CREATE POLICY "Active accounts can create roles"
ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());

CREATE POLICY "Active accounts can create properties"
ON public.properties AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());
CREATE POLICY "Active accounts can update properties"
ON public.properties AS RESTRICTIVE FOR UPDATE TO authenticated
USING (public.is_current_user_active())
WITH CHECK (public.is_current_user_active());
CREATE POLICY "Active accounts can delete properties"
ON public.properties AS RESTRICTIVE FOR DELETE TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Active accounts can submit applications"
ON public.rental_applications AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());
CREATE POLICY "Active accounts can update applications"
ON public.rental_applications AS RESTRICTIVE FOR UPDATE TO authenticated
USING (public.is_current_user_active())
WITH CHECK (public.is_current_user_active());

CREATE POLICY "Active accounts can submit tours"
ON public.tour_requests AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());
CREATE POLICY "Active accounts can update tours"
ON public.tour_requests AS RESTRICTIVE FOR UPDATE TO authenticated
USING (public.is_current_user_active())
WITH CHECK (public.is_current_user_active());

CREATE POLICY "Active accounts can send messages"
ON public.messages AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());
CREATE POLICY "Active accounts can update messages"
ON public.messages AS RESTRICTIVE FOR UPDATE TO authenticated
USING (public.is_current_user_active())
WITH CHECK (public.is_current_user_active());
CREATE POLICY "Active accounts can delete messages"
ON public.messages AS RESTRICTIVE FOR DELETE TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Active accounts can use saved properties"
ON public.saved_properties AS RESTRICTIVE FOR ALL TO authenticated
USING (public.is_current_user_active())
WITH CHECK (public.is_current_user_active());

CREATE POLICY "Active accounts can create chat rooms"
ON public.chat_rooms AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());
CREATE POLICY "Active accounts can delete chat rooms"
ON public.chat_rooms AS RESTRICTIVE FOR DELETE TO authenticated
USING (public.is_current_user_active());
CREATE POLICY "Active accounts can join chat rooms"
ON public.chat_room_members AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());
CREATE POLICY "Active accounts can update chat membership"
ON public.chat_room_members AS RESTRICTIVE FOR UPDATE TO authenticated
USING (public.is_current_user_active())
WITH CHECK (public.is_current_user_active());
CREATE POLICY "Active accounts can send chat messages"
ON public.chat_room_messages AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());

CREATE POLICY "Active accounts can apply as affiliates"
ON public.affiliate_profiles AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());
CREATE POLICY "Active accounts can create referrals"
ON public.referral_signups AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());
CREATE POLICY "Active accounts can request roles"
ON public.role_requests AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());
CREATE POLICY "Active accounts can submit verification"
ON public.id_verifications AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());
CREATE POLICY "Active accounts can update verification"
ON public.id_verifications AS RESTRICTIVE FOR UPDATE TO authenticated
USING (public.is_current_user_active())
WITH CHECK (public.is_current_user_active());

CREATE OR REPLACE FUNCTION public.get_public_property_owner(p_property_id uuid)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  display_name_preference text,
  agency_name text,
  role public.app_role
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.full_name, p.display_name_preference, p.agency_name, ur.role
  FROM public.properties property
  JOIN public.profiles p ON p.user_id = property.owner_id
  LEFT JOIN public.user_roles ur ON ur.user_id = property.owner_id
  WHERE property.id = p_property_id
    AND (
      property.status = 'active'::public.property_status
      OR property.owner_id = auth.uid()
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_property_owner(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_property_owner(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.protect_profile_system_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = OLD.user_id
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
       OR NEW.is_approved IS DISTINCT FROM OLD.is_approved
       OR NEW.is_suspended IS DISTINCT FROM OLD.is_suspended
       OR NEW.suspension_reason IS DISTINCT FROM OLD.suspension_reason THEN
      RAISE EXCEPTION 'System-managed profile fields cannot be changed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_system_fields ON public.profiles;
CREATE TRIGGER protect_profile_system_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_system_fields();

-- Searches use a narrow, authenticated RPC instead of unrestricted profile
-- table reads. Require a useful query length to limit bulk enumeration.
CREATE OR REPLACE FUNCTION public.search_profiles_for_invite(search_term text)
RETURNS TABLE(user_id uuid, full_name text, email text, username text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF char_length(btrim(search_term)) < 3 THEN
    RAISE EXCEPTION 'Enter at least 3 characters';
  END IF;

  RETURN QUERY
  SELECT p.user_id, p.full_name, p.email, p.username
  FROM public.profiles p
  WHERE (
      p.email ILIKE '%' || btrim(search_term) || '%'
      OR p.username ILIKE '%' || btrim(search_term) || '%'
      OR p.full_name ILIKE '%' || btrim(search_term) || '%'
    )
    AND p.user_id != auth.uid()
  LIMIT 10;
END;
$$;

REVOKE ALL ON FUNCTION public.search_profiles_for_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_profiles_for_invite(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.search_profiles_by_role(
  search_term text,
  target_role public.app_role
)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  email text,
  username text,
  role public.app_role
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF char_length(btrim(search_term)) < 3 THEN
    RAISE EXCEPTION 'Enter at least 3 characters';
  END IF;

  RETURN QUERY
  SELECT p.user_id, p.full_name, p.email, p.username, roles.role
  FROM public.profiles p
  JOIN public.user_roles roles
    ON roles.user_id = p.user_id AND roles.role = target_role
  WHERE (
      p.email ILIKE '%' || btrim(search_term) || '%'
      OR p.username ILIKE '%' || btrim(search_term) || '%'
      OR p.full_name ILIKE '%' || btrim(search_term) || '%'
    )
    AND p.user_id != auth.uid()
    AND p.is_suspended = false
  LIMIT 10;
END;
$$;

REVOKE ALL ON FUNCTION public.search_profiles_by_role(text, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_profiles_by_role(text, public.app_role) TO authenticated;

-- Role requests must begin pending and cannot contain forged review data.
DROP POLICY IF EXISTS "Users can request role upgrades" ON public.role_requests;
CREATE POLICY "Users can request role upgrades"
ON public.role_requests FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND requested_role IN ('landlord'::public.app_role, 'agent'::public.app_role)
  AND status = 'pending'
  AND reviewed_by IS NULL
  AND reviewed_at IS NULL
  AND review_note IS NULL
);

-- A self-service affiliate application may only contain the safe defaults.
-- Activation, rates, and balances remain admin-managed.
DROP POLICY IF EXISTS "Affiliates can update their own profile" ON public.affiliate_profiles;
DROP POLICY IF EXISTS "Users can apply for affiliate program" ON public.affiliate_profiles;
CREATE POLICY "Users can apply for affiliate program"
ON public.affiliate_profiles FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND is_active = false
  AND commission_rate = 5
  AND total_earnings = 0
  AND available_balance = 0
);

-- Attribute one signup once, only to the active affiliate matching the code.
WITH ranked_referrals AS (
  SELECT id, row_number() OVER (
    PARTITION BY referred_user_id ORDER BY created_at, id
  ) AS row_number
  FROM public.referral_signups
)
DELETE FROM public.referral_signups AS referrals
USING ranked_referrals
WHERE referrals.id = ranked_referrals.id
  AND ranked_referrals.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS referral_signups_one_attribution_per_user
  ON public.referral_signups (referred_user_id);

DROP POLICY IF EXISTS "System can insert referral signups" ON public.referral_signups;
CREATE POLICY "Users can record their own referral"
ON public.referral_signups FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = referred_user_id
  AND referred_user_id != affiliate_user_id
  AND status = 'signed_up'
  AND EXISTS (
    SELECT 1
    FROM public.affiliate_profiles affiliate
    WHERE affiliate.user_id = referral_signups.affiliate_user_id
      AND affiliate.referral_code = referral_signups.referral_code_used
      AND affiliate.is_active = true
  )
);

-- Withdrawal creation and review are atomic RPCs. Direct client inserts and
-- direct status updates are removed to prevent forged or duplicate payouts.
DROP POLICY IF EXISTS "Affiliates can request withdrawals" ON public.affiliate_withdrawals;
DROP POLICY IF EXISTS "Admins can update withdrawals" ON public.affiliate_withdrawals;

CREATE OR REPLACE FUNCTION public.request_affiliate_withdrawal(
  p_amount numeric,
  p_bank_name text,
  p_account_number text,
  p_account_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affiliate public.affiliate_profiles%ROWTYPE;
  pending_total numeric;
  minimum_amount numeric;
  withdrawal_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Withdrawal amount must be greater than zero';
  END IF;
  IF char_length(btrim(COALESCE(p_bank_name, ''))) < 2
     OR p_account_number !~ '^[0-9]{10}$'
     OR char_length(btrim(COALESCE(p_account_name, ''))) < 2 THEN
    RAISE EXCEPTION 'Enter valid Nigerian bank account details';
  END IF;

  SELECT * INTO affiliate
  FROM public.affiliate_profiles
  WHERE user_id = auth.uid() AND is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'An active affiliate account is required';
  END IF;

  SELECT COALESCE((value #>> '{}')::numeric, 0)
  INTO minimum_amount
  FROM public.platform_settings
  WHERE key = 'min_withdrawal_amount';
  minimum_amount := COALESCE(minimum_amount, 0);

  IF p_amount < minimum_amount THEN
    RAISE EXCEPTION 'Withdrawal is below the platform minimum';
  END IF;

  SELECT COALESCE(sum(amount), 0)
  INTO pending_total
  FROM public.affiliate_withdrawals
  WHERE affiliate_user_id = auth.uid() AND status = 'pending';

  IF p_amount > affiliate.available_balance - pending_total THEN
    RAISE EXCEPTION 'Insufficient available balance';
  END IF;

  INSERT INTO public.affiliate_withdrawals (
    affiliate_user_id, amount, bank_name, account_number, account_name
  ) VALUES (
    auth.uid(), p_amount, btrim(p_bank_name), p_account_number, btrim(p_account_name)
  )
  RETURNING id INTO withdrawal_id;

  RETURN withdrawal_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_affiliate_withdrawal(
  p_withdrawal_id uuid,
  p_status text,
  p_admin_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  withdrawal public.affiliate_withdrawals%ROWTYPE;
  current_balance numeric;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can review withdrawals';
  END IF;
  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid withdrawal status';
  END IF;

  SELECT * INTO withdrawal
  FROM public.affiliate_withdrawals
  WHERE id = p_withdrawal_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found or already reviewed';
  END IF;

  IF p_status = 'approved' THEN
    SELECT available_balance INTO current_balance
    FROM public.affiliate_profiles
    WHERE user_id = withdrawal.affiliate_user_id
    FOR UPDATE;

    IF current_balance IS NULL OR current_balance < withdrawal.amount THEN
      RAISE EXCEPTION 'Affiliate balance is no longer sufficient';
    END IF;

    UPDATE public.affiliate_profiles
    SET available_balance = available_balance - withdrawal.amount
    WHERE user_id = withdrawal.affiliate_user_id;
  END IF;

  UPDATE public.affiliate_withdrawals
  SET status = p_status,
      admin_note = NULLIF(btrim(p_admin_note), ''),
      reviewed_by = auth.uid(),
      reviewed_at = now()
  WHERE id = p_withdrawal_id;
END;
$$;

REVOKE ALL ON FUNCTION public.request_affiliate_withdrawal(numeric, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_affiliate_withdrawal(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_affiliate_withdrawal(numeric, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_affiliate_withdrawal(uuid, text, text) TO authenticated;

-- Listing owners can submit for review and manage an already-approved listing,
-- but they cannot feature a listing or approve it themselves.
DROP POLICY IF EXISTS "Landlords and agents can create properties" ON public.properties;
CREATE POLICY "Landlords and agents can create properties"
ON public.properties FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = owner_id
  AND (public.has_role(auth.uid(), 'landlord') OR public.has_role(auth.uid(), 'agent'))
  AND status IN ('draft'::public.property_status, 'pending'::public.property_status)
  AND COALESCE(is_featured, false) = false
);

CREATE OR REPLACE FUNCTION public.protect_property_approval_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = OLD.owner_id
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    IF NEW.owner_id IS DISTINCT FROM OLD.owner_id
       OR NEW.is_featured IS DISTINCT FROM OLD.is_featured
       OR (NEW.status = 'active'::public.property_status
           AND OLD.status != 'active'::public.property_status) THEN
      RAISE EXCEPTION 'Only an admin can approve or feature a listing';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_property_approval_fields ON public.properties;
CREATE TRIGGER protect_property_approval_fields
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.protect_property_approval_fields();

-- Applications and tours must reference the actual owner of an active listing
-- and begin pending. Owners may change only their workflow status afterward.
DROP POLICY IF EXISTS "Authenticated users can submit applications" ON public.rental_applications;
CREATE POLICY "Tenants can submit valid applications"
ON public.rental_applications FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = applicant_id
  AND public.has_role(auth.uid(), 'tenant'::public.app_role)
  AND status = 'pending'
  AND EXISTS (
    SELECT 1 FROM public.properties property
    WHERE property.id = rental_applications.property_id
      AND property.owner_id = rental_applications.landlord_id
      AND property.status = 'active'::public.property_status
  )
);

CREATE OR REPLACE FUNCTION public.protect_application_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = OLD.landlord_id
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.property_id IS DISTINCT FROM OLD.property_id
       OR NEW.applicant_id IS DISTINCT FROM OLD.applicant_id
       OR NEW.landlord_id IS DISTINCT FROM OLD.landlord_id
       OR NEW.full_name IS DISTINCT FROM OLD.full_name
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.phone IS DISTINCT FROM OLD.phone
       OR NEW.employment_status IS DISTINCT FROM OLD.employment_status
       OR NEW.monthly_income IS DISTINCT FROM OLD.monthly_income
       OR NEW.move_in_date IS DISTINCT FROM OLD.move_in_date
       OR NEW.message IS DISTINCT FROM OLD.message
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Only application status can be changed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_application_fields ON public.rental_applications;
CREATE TRIGGER protect_application_fields
  BEFORE UPDATE ON public.rental_applications
  FOR EACH ROW EXECUTE FUNCTION public.protect_application_fields();

DROP POLICY IF EXISTS "Tenants can submit tour requests" ON public.tour_requests;
CREATE POLICY "Tenants can submit valid tour requests"
ON public.tour_requests FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = tenant_id
  AND public.has_role(auth.uid(), 'tenant'::public.app_role)
  AND status = 'pending'
  AND EXISTS (
    SELECT 1 FROM public.properties property
    WHERE property.id = tour_requests.property_id
      AND property.owner_id = tour_requests.landlord_id
      AND property.status = 'active'::public.property_status
  )
);

CREATE OR REPLACE FUNCTION public.protect_tour_request_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = OLD.landlord_id
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.property_id IS DISTINCT FROM OLD.property_id
       OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
       OR NEW.landlord_id IS DISTINCT FROM OLD.landlord_id
       OR NEW.preferred_date IS DISTINCT FROM OLD.preferred_date
       OR NEW.preferred_time IS DISTINCT FROM OLD.preferred_time
       OR NEW.message IS DISTINCT FROM OLD.message
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Only tour status can be changed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_tour_request_fields ON public.tour_requests;
CREATE TRIGGER protect_tour_request_fields
  BEFORE UPDATE ON public.tour_requests
  FOR EACH ROW EXECUTE FUNCTION public.protect_tour_request_fields();

-- Messages are immutable after sending except for the recipient's read flag.
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
CREATE POLICY "Authenticated users can send valid messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND sender_id != recipient_id
  AND is_read = false
  AND char_length(btrim(subject)) BETWEEN 1 AND 200
  AND char_length(btrim(message)) BETWEEN 1 AND 5000
);

CREATE OR REPLACE FUNCTION public.protect_message_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = OLD.recipient_id
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
       OR NEW.recipient_id IS DISTINCT FROM OLD.recipient_id
       OR NEW.property_id IS DISTINCT FROM OLD.property_id
       OR NEW.subject IS DISTINCT FROM OLD.subject
       OR NEW.message IS DISTINCT FROM OLD.message
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
       OR NEW.is_read IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'Recipients may only mark messages as read';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_message_fields ON public.messages;
CREATE TRIGGER protect_message_fields
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.protect_message_fields();

-- New identity documents are stored privately. The database stores only the
-- object path; admins request a short-lived signed URL when reviewing it.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Users can upload their verification document"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their verification document"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view verification documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Users can submit their own verification" ON public.id_verifications;
CREATE POLICY "Users can submit their own pending verification"
ON public.id_verifications FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND reviewed_at IS NULL
  AND document_url !~ '^https?://'
);

DROP POLICY IF EXISTS "Users can update their own pending verification" ON public.id_verifications;
CREATE POLICY "Users can resubmit their own verification"
ON public.id_verifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status IN ('pending', 'rejected'))
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND reviewed_at IS NULL
  AND document_url !~ '^https?://'
);

CREATE OR REPLACE FUNCTION public.protect_verification_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = OLD.user_id
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Verification ownership cannot be changed';
    END IF;
    NEW.status := 'pending';
    NEW.reviewed_at := NULL;
    NEW.submitted_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_verification_fields ON public.id_verifications;
CREATE TRIGGER protect_verification_fields
  BEFORE UPDATE ON public.id_verifications
  FOR EACH ROW EXECUTE FUNCTION public.protect_verification_fields();

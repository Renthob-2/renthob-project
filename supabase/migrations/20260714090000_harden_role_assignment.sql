-- A user has one primary role. Keep the most privileged existing role if old
-- signup code created more than one row for the same account.
WITH ranked_roles AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id
      ORDER BY
        CASE role::text
          WHEN 'admin' THEN 1
          WHEN 'affiliate' THEN 2
          WHEN 'agent' THEN 3
          WHEN 'landlord' THEN 4
          ELSE 5
        END,
        created_at,
        id
    ) AS row_number
  FROM public.user_roles
)
DELETE FROM public.user_roles AS roles
USING ranked_roles
WHERE roles.id = ranked_roles.id
  AND ranked_roles.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS user_roles_one_primary_role_per_user
  ON public.user_roles (user_id);

-- The auth trigger creates the safe tenant role. A client may only restore
-- that same safe default if an older environment is missing the trigger row.
DROP POLICY IF EXISTS "Users can insert their own role on signup" ON public.user_roles;
CREATE POLICY "Users can insert tenant role only"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'tenant'::public.app_role
);

-- Prevent repeated pending landlord/agent requests caused by auth callbacks
-- running in multiple tabs or on a slow connection.
WITH ranked_requests AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, requested_role
      ORDER BY created_at, id
    ) AS row_number
  FROM public.role_requests
  WHERE status = 'pending'
)
DELETE FROM public.role_requests AS requests
USING ranked_requests
WHERE requests.id = ranked_requests.id
  AND ranked_requests.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS role_requests_one_pending_per_user_role
  ON public.role_requests (user_id, requested_role)
  WHERE status = 'pending';

CREATE OR REPLACE FUNCTION public.approve_role_request(request_id uuid, admin_note text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req public.role_requests%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can approve role requests';
  END IF;

  SELECT * INTO req
  FROM public.role_requests
  WHERE id = request_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (req.user_id, req.requested_role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = EXCLUDED.role;

  UPDATE public.role_requests
  SET status = 'approved',
      reviewed_by = auth.uid(),
      review_note = admin_note,
      reviewed_at = now()
  WHERE id = request_id;
END;
$$;

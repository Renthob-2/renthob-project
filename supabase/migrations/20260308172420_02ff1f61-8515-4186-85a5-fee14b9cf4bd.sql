-- Create role_requests table for landlord/agent role upgrade requests
CREATE TABLE public.role_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  requested_role app_role NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

-- Enable RLS
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own role request
CREATE POLICY "Users can request role upgrades"
ON public.role_requests FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  requested_role IN ('landlord'::app_role, 'agent'::app_role)
);

-- Users can view their own requests
CREATE POLICY "Users can view their own role requests"
ON public.role_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all role requests"
ON public.role_requests FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update requests
CREATE POLICY "Admins can update role requests"
ON public.role_requests FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a function for admins to approve role requests (updates user_roles)
CREATE OR REPLACE FUNCTION public.approve_role_request(request_id uuid, admin_note text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req record;
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can approve role requests';
  END IF;

  -- Get the request
  SELECT * INTO req FROM public.role_requests WHERE id = request_id AND status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;

  -- Update user role
  UPDATE public.user_roles SET role = req.requested_role WHERE user_id = req.user_id;

  -- Mark request as approved
  UPDATE public.role_requests 
  SET status = 'approved', reviewed_by = auth.uid(), review_note = admin_note, reviewed_at = now()
  WHERE id = request_id;
END;
$$;

-- Create a function for admins to reject role requests
CREATE OR REPLACE FUNCTION public.reject_role_request(request_id uuid, admin_note text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can reject role requests';
  END IF;

  UPDATE public.role_requests 
  SET status = 'rejected', reviewed_by = auth.uid(), review_note = admin_note, reviewed_at = now()
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
END;
$$;
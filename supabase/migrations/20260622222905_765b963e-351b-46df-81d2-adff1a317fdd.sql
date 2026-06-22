
-- 1. Create audit log table
CREATE TABLE public.role_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'request_submitted' | 'request_approved' | 'request_rejected' | 'role_assigned' | 'role_changed' | 'role_removed'
  actor_id uuid,            -- the user performing the action (admin for status changes, requester for submissions, NULL for system)
  subject_user_id uuid NOT NULL, -- the user whose role/request this concerns
  old_role app_role,
  new_role app_role,
  requested_role app_role,
  request_id uuid,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX role_audit_log_subject_idx ON public.role_audit_log(subject_user_id, created_at DESC);
CREATE INDEX role_audit_log_actor_idx   ON public.role_audit_log(actor_id, created_at DESC);
CREATE INDEX role_audit_log_event_idx   ON public.role_audit_log(event_type, created_at DESC);

GRANT SELECT ON public.role_audit_log TO authenticated;
GRANT ALL ON public.role_audit_log TO service_role;

ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view role audit log"
  ON public.role_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- No INSERT/UPDATE/DELETE policies: only SECURITY DEFINER triggers (service_role) write entries.

-- 2. Trigger: log role_request inserts
CREATE OR REPLACE FUNCTION public.log_role_request_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.role_audit_log (event_type, actor_id, subject_user_id, requested_role, request_id, details)
  VALUES ('request_submitted', NEW.user_id, NEW.user_id, NEW.requested_role, NEW.id,
          'User submitted request to become ' || NEW.requested_role);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_role_request_submission ON public.role_requests;
CREATE TRIGGER trg_log_role_request_submission
  AFTER INSERT ON public.role_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_role_request_submission();

-- 3. Trigger: log role_request status changes (approve/reject)
CREATE OR REPLACE FUNCTION public.log_role_request_decision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO public.role_audit_log (event_type, actor_id, subject_user_id, requested_role, request_id, details)
    VALUES (
      'request_' || NEW.status,
      COALESCE(NEW.reviewed_by, auth.uid()),
      NEW.user_id,
      NEW.requested_role,
      NEW.id,
      CASE WHEN NEW.review_note IS NOT NULL AND length(NEW.review_note) > 0
           THEN 'Note: ' || NEW.review_note ELSE NULL END
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_role_request_decision ON public.role_requests;
CREATE TRIGGER trg_log_role_request_decision
  AFTER UPDATE ON public.role_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_role_request_decision();

-- 4. Trigger: log user_roles INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION public.log_user_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_audit_log (event_type, actor_id, subject_user_id, new_role, details)
    VALUES ('role_assigned', auth.uid(), NEW.user_id, NEW.role,
            'Role ' || NEW.role || ' assigned');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
      INSERT INTO public.role_audit_log (event_type, actor_id, subject_user_id, old_role, new_role, details)
      VALUES ('role_changed', auth.uid(), NEW.user_id, OLD.role, NEW.role,
              'Role changed from ' || OLD.role || ' to ' || NEW.role);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.role_audit_log (event_type, actor_id, subject_user_id, old_role, details)
    VALUES ('role_removed', auth.uid(), OLD.user_id, OLD.role,
            'Role ' || OLD.role || ' removed');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_user_role_change ON public.user_roles;
CREATE TRIGGER trg_log_user_role_change
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_user_role_change();

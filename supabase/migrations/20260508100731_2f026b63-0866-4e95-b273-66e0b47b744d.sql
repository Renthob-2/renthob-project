
-- 1. Backfill: ensure every existing user has a role (default tenant)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'tenant'::app_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.id IS NULL;

-- 2. Update handle_new_user trigger to auto-assign tenant role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'tenant'::app_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Notify all admins when a new role request is submitted
CREATE OR REPLACE FUNCTION public.notify_admins_of_role_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requester_name TEXT;
BEGIN
  SELECT COALESCE(full_name, email, 'A user') INTO requester_name
  FROM public.profiles WHERE user_id = NEW.user_id;

  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  SELECT ur.user_id, 'role_request', 'New Role Request',
    requester_name || ' requested to become a ' || NEW.requested_role || '.', NEW.id
  FROM public.user_roles ur
  WHERE ur.role = 'admin'::app_role;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_role_request_created ON public.role_requests;
CREATE TRIGGER on_role_request_created
  AFTER INSERT ON public.role_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_of_role_request();

-- 4. Notify user when their role is changed
CREATE OR REPLACE FUNCTION public.notify_user_of_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (NEW.user_id, 'role_changed', 'Your role has been updated',
      'Your account role is now ' || NEW.role || '. Your dashboard has been updated.', NEW.id);
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_user_role_changed ON public.user_roles;
CREATE TRIGGER on_user_role_changed
  AFTER UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_role_change();

-- 5. Enable realtime for user_roles so dashboards reflect role changes instantly
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;

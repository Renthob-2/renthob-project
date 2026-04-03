
-- Trigger: Notify landlord on new rental application
CREATE OR REPLACE FUNCTION public.notify_new_rental_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prop_title TEXT;
BEGIN
  SELECT title INTO prop_title FROM public.properties WHERE id = NEW.property_id;
  
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (
    NEW.landlord_id,
    'new_application',
    'New Rental Application',
    'You received a new application for "' || COALESCE(prop_title, 'your property') || '" from ' || NEW.full_name || '.',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_rental_application_insert
AFTER INSERT ON public.rental_applications
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_rental_application();

-- Trigger: Notify landlord on new tour request
CREATE OR REPLACE FUNCTION public.notify_new_tour_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prop_title TEXT;
  tenant_name TEXT;
BEGIN
  SELECT title INTO prop_title FROM public.properties WHERE id = NEW.property_id;
  SELECT full_name INTO tenant_name FROM public.profiles WHERE user_id = NEW.tenant_id;
  
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (
    NEW.landlord_id,
    'new_tour_request',
    'New Tour Request',
    COALESCE(tenant_name, 'A tenant') || ' requested a tour for "' || COALESCE(prop_title, 'your property') || '" on ' || NEW.preferred_date || '.',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_tour_request_insert
AFTER INSERT ON public.tour_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_tour_request();

-- Trigger: Notify tenant on application status change
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prop_title TEXT;
  status_label TEXT;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  IF NEW.status NOT IN ('reviewing', 'approved', 'rejected') THEN
    RETURN NEW;
  END IF;

  SELECT title INTO prop_title FROM public.properties WHERE id = NEW.property_id;
  
  status_label := CASE NEW.status
    WHEN 'reviewing' THEN 'is now being reviewed'
    WHEN 'approved' THEN 'has been approved! 🎉'
    WHEN 'rejected' THEN 'was not approved'
  END;

  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (
    NEW.applicant_id,
    'application_' || NEW.status,
    CASE NEW.status
      WHEN 'approved' THEN 'Application Approved!'
      WHEN 'rejected' THEN 'Application Update'
      ELSE 'Application Under Review'
    END,
    'Your application for "' || COALESCE(prop_title, 'a property') || '" ' || status_label || '.',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_rental_application_status_change
AFTER UPDATE ON public.rental_applications
FOR EACH ROW
EXECUTE FUNCTION public.notify_application_status_change();

-- Trigger: Notify tenant on tour request status change
CREATE OR REPLACE FUNCTION public.notify_tour_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prop_title TEXT;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  IF NEW.status NOT IN ('confirmed', 'declined') THEN
    RETURN NEW;
  END IF;

  SELECT title INTO prop_title FROM public.properties WHERE id = NEW.property_id;

  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (
    NEW.tenant_id,
    'tour_' || NEW.status,
    CASE NEW.status
      WHEN 'confirmed' THEN 'Tour Confirmed! 🎉'
      ELSE 'Tour Declined'
    END,
    'Your tour request for "' || COALESCE(prop_title, 'a property') || '" on ' || NEW.preferred_date || ' has been ' || NEW.status || '.',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_tour_request_status_change
AFTER UPDATE ON public.tour_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_tour_status_change();


-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  new_application BOOLEAN NOT NULL DEFAULT true,
  application_status BOOLEAN NOT NULL DEFAULT true,
  new_tour_request BOOLEAN NOT NULL DEFAULT true,
  tour_status BOOLEAN NOT NULL DEFAULT true,
  commission_earned BOOLEAN NOT NULL DEFAULT true,
  withdrawal_status BOOLEAN NOT NULL DEFAULT true,
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  browser_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all preferences"
  ON public.notification_preferences FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to check if a user has a notification type enabled
CREATE OR REPLACE FUNCTION public.is_notification_enabled(_user_id UUID, _type TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT
      CASE _type
        WHEN 'new_application' THEN new_application
        WHEN 'application_reviewing' THEN application_status
        WHEN 'application_approved' THEN application_status
        WHEN 'application_rejected' THEN application_status
        WHEN 'new_tour_request' THEN new_tour_request
        WHEN 'tour_confirmed' THEN tour_status
        WHEN 'tour_declined' THEN tour_status
        WHEN 'commission_earned' THEN commission_earned
        WHEN 'withdrawal_approved' THEN withdrawal_status
        WHEN 'withdrawal_rejected' THEN withdrawal_status
        ELSE true
      END
    FROM public.notification_preferences
    WHERE user_id = _user_id),
    true  -- default to enabled if no preferences row exists
  );
$$;

-- Update existing trigger functions to check preferences

CREATE OR REPLACE FUNCTION public.notify_new_rental_application()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE prop_title TEXT;
BEGIN
  IF NOT is_notification_enabled(NEW.landlord_id, 'new_application') THEN RETURN NEW; END IF;
  SELECT title INTO prop_title FROM public.properties WHERE id = NEW.property_id;
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (NEW.landlord_id, 'new_application', 'New Rental Application',
    'You received a new application for "' || COALESCE(prop_title, 'your property') || '" from ' || NEW.full_name || '.', NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_new_tour_request()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE prop_title TEXT; tenant_name TEXT;
BEGIN
  IF NOT is_notification_enabled(NEW.landlord_id, 'new_tour_request') THEN RETURN NEW; END IF;
  SELECT title INTO prop_title FROM public.properties WHERE id = NEW.property_id;
  SELECT full_name INTO tenant_name FROM public.profiles WHERE user_id = NEW.tenant_id;
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (NEW.landlord_id, 'new_tour_request', 'New Tour Request',
    COALESCE(tenant_name, 'A tenant') || ' requested a tour for "' || COALESCE(prop_title, 'your property') || '" on ' || NEW.preferred_date || '.', NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE prop_title TEXT; status_label TEXT; notif_type TEXT;
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('reviewing', 'approved', 'rejected') THEN RETURN NEW; END IF;
  notif_type := 'application_' || NEW.status;
  IF NOT is_notification_enabled(NEW.applicant_id, notif_type) THEN RETURN NEW; END IF;
  SELECT title INTO prop_title FROM public.properties WHERE id = NEW.property_id;
  status_label := CASE NEW.status
    WHEN 'reviewing' THEN 'is now being reviewed'
    WHEN 'approved' THEN 'has been approved! 🎉'
    WHEN 'rejected' THEN 'was not approved' END;
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (NEW.applicant_id, notif_type,
    CASE NEW.status WHEN 'approved' THEN 'Application Approved!' WHEN 'rejected' THEN 'Application Update' ELSE 'Application Under Review' END,
    'Your application for "' || COALESCE(prop_title, 'a property') || '" ' || status_label || '.', NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_tour_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE prop_title TEXT; notif_type TEXT;
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('confirmed', 'declined') THEN RETURN NEW; END IF;
  notif_type := 'tour_' || NEW.status;
  IF NOT is_notification_enabled(NEW.tenant_id, notif_type) THEN RETURN NEW; END IF;
  SELECT title INTO prop_title FROM public.properties WHERE id = NEW.property_id;
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (NEW.tenant_id, notif_type,
    CASE NEW.status WHEN 'confirmed' THEN 'Tour Confirmed! 🎉' ELSE 'Tour Declined' END,
    'Your tour request for "' || COALESCE(prop_title, 'a property') || '" on ' || NEW.preferred_date || ' has been ' || NEW.status || '.', NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_affiliate_commission()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT is_notification_enabled(NEW.affiliate_user_id, 'commission_earned') THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (NEW.affiliate_user_id, 'commission_earned', 'New Commission Earned!',
    'You earned ₦' || NEW.commission_amount::TEXT || ' commission on a ₦' || NEW.transaction_amount::TEXT || ' transaction.', NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_affiliate_withdrawal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    IF NOT is_notification_enabled(NEW.affiliate_user_id, 'withdrawal_' || NEW.status) THEN RETURN NEW; END IF;
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (NEW.affiliate_user_id, 'withdrawal_' || NEW.status,
      CASE WHEN NEW.status = 'approved' THEN 'Withdrawal Approved!' ELSE 'Withdrawal Rejected' END,
      CASE WHEN NEW.status = 'approved' THEN 'Your withdrawal of ₦' || NEW.amount::TEXT || ' has been approved.'
        ELSE 'Your withdrawal of ₦' || NEW.amount::TEXT || ' was rejected.' || COALESCE(' Reason: ' || NEW.admin_note, '') END,
      NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

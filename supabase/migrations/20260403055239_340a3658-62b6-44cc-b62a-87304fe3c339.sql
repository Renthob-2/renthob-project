
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- System insert (via triggers running as SECURITY DEFINER)
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function: notify affiliate on new commission
CREATE OR REPLACE FUNCTION public.notify_affiliate_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (
    NEW.affiliate_user_id,
    'commission_earned',
    'New Commission Earned!',
    'You earned ₦' || NEW.commission_amount::TEXT || ' commission on a ₦' || NEW.transaction_amount::TEXT || ' transaction.',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_affiliate_commission_insert
AFTER INSERT ON public.affiliate_commissions
FOR EACH ROW
EXECUTE FUNCTION public.notify_affiliate_commission();

-- Trigger function: notify affiliate on withdrawal status change
CREATE OR REPLACE FUNCTION public.notify_affiliate_withdrawal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.affiliate_user_id,
      'withdrawal_' || NEW.status,
      CASE WHEN NEW.status = 'approved' THEN 'Withdrawal Approved!' ELSE 'Withdrawal Rejected' END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Your withdrawal of ₦' || NEW.amount::TEXT || ' has been approved.'
        ELSE 'Your withdrawal of ₦' || NEW.amount::TEXT || ' was rejected.' || COALESCE(' Reason: ' || NEW.admin_note, '')
      END,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_affiliate_withdrawal_update
AFTER UPDATE ON public.affiliate_withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.notify_affiliate_withdrawal();

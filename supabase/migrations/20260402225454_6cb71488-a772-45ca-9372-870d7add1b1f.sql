
-- Add affiliate to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'affiliate';

-- Create affiliate_profiles table
CREATE TABLE public.affiliate_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  referral_code TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC NOT NULL DEFAULT 5.0,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  available_balance NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view their own profile" ON public.affiliate_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all affiliate profiles" ON public.affiliate_profiles
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert affiliate profiles" ON public.affiliate_profiles
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update affiliate profiles" ON public.affiliate_profiles
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Affiliates can update their own profile" ON public.affiliate_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create referral_signups table
CREATE TABLE public.referral_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referred_user_id UUID NOT NULL,
  affiliate_user_id UUID NOT NULL,
  referral_code_used TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'signed_up',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT no_self_referral CHECK (referred_user_id != affiliate_user_id)
);

ALTER TABLE public.referral_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view their own referrals" ON public.referral_signups
  FOR SELECT TO authenticated USING (auth.uid() = affiliate_user_id);

CREATE POLICY "Admins can view all referrals" ON public.referral_signups
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert referral signups" ON public.referral_signups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = referred_user_id AND referred_user_id != affiliate_user_id);

CREATE POLICY "Admins can update referral signups" ON public.referral_signups
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Create affiliate_commissions table
CREATE TABLE public.affiliate_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_user_id UUID NOT NULL,
  referral_signup_id UUID REFERENCES public.referral_signups(id),
  property_id UUID REFERENCES public.properties(id),
  transaction_amount NUMERIC NOT NULL DEFAULT 0,
  commission_rate NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view their own commissions" ON public.affiliate_commissions
  FOR SELECT TO authenticated USING (auth.uid() = affiliate_user_id);

CREATE POLICY "Admins can view all commissions" ON public.affiliate_commissions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert commissions" ON public.affiliate_commissions
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update commissions" ON public.affiliate_commissions
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Create affiliate_withdrawals table
CREATE TABLE public.affiliate_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view their own withdrawals" ON public.affiliate_withdrawals
  FOR SELECT TO authenticated USING (auth.uid() = affiliate_user_id);

CREATE POLICY "Affiliates can request withdrawals" ON public.affiliate_withdrawals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = affiliate_user_id);

CREATE POLICY "Admins can view all withdrawals" ON public.affiliate_withdrawals
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update withdrawals" ON public.affiliate_withdrawals
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at on affiliate tables
CREATE TRIGGER update_affiliate_profiles_updated_at
  BEFORE UPDATE ON public.affiliate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referral_signups_updated_at
  BEFORE UPDATE ON public.referral_signups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_commissions_updated_at
  BEFORE UPDATE ON public.affiliate_commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to validate referral code and get affiliate user_id
CREATE OR REPLACE FUNCTION public.get_affiliate_by_code(code TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.affiliate_profiles
  WHERE referral_code = code AND is_active = true
  LIMIT 1;
$$;

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can delete settings" ON public.platform_settings;

CREATE POLICY "Authenticated can read settings"
ON public.platform_settings FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can insert settings"
ON public.platform_settings FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
ON public.platform_settings FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete settings"
ON public.platform_settings FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.platform_settings (key, value, description) VALUES
  ('default_affiliate_commission_rate', '5'::jsonb, 'Default commission rate (%) applied to new affiliates'),
  ('min_withdrawal_amount', '5000'::jsonb, 'Minimum withdrawal amount in Naira')
ON CONFLICT (key) DO NOTHING;

-- Admin-only: bulk update commission rate for selected (or all) active affiliates
CREATE OR REPLACE FUNCTION public.bulk_update_affiliate_commission(new_rate numeric, target_user_ids uuid[] DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can bulk-update commission rates';
  END IF;
  IF new_rate IS NULL OR new_rate < 0 OR new_rate > 100 THEN
    RAISE EXCEPTION 'Rate must be between 0 and 100';
  END IF;

  IF target_user_ids IS NULL OR array_length(target_user_ids, 1) IS NULL THEN
    UPDATE public.affiliate_profiles SET commission_rate = new_rate WHERE is_active = true;
  ELSE
    UPDATE public.affiliate_profiles SET commission_rate = new_rate WHERE user_id = ANY(target_user_ids);
  END IF;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.bulk_update_affiliate_commission(numeric, uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bulk_update_affiliate_commission(numeric, uuid[]) TO authenticated;
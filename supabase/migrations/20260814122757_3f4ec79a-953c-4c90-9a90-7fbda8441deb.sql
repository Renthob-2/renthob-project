CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'tenant'::app_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique_idx ON public.profiles (phone) WHERE phone IS NOT NULL AND phone <> '';
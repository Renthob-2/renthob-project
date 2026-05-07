-- Affiliate is an add-on capability, not a primary role.
-- Revert any users whose primary role was set to 'affiliate' back to 'tenant'.
UPDATE public.user_roles
SET role = 'tenant'::app_role
WHERE role = 'affiliate'::app_role;
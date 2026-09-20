revoke all on function public.bootstrap_first_admin() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.has_role(uuid, app_role) from public, anon;
CREATE TABLE public.staff_access (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.staff_access TO service_role;
ALTER TABLE public.staff_access ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.staff_access_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL,
  success boolean NOT NULL,
  device text,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.staff_access_log TO service_role;
ALTER TABLE public.staff_access_log ENABLE ROW LEVEL SECURITY;

INSERT INTO public.staff_access (code, label) VALUES ('BOH-TEAM-2026', 'Begleitteam Japanreise');
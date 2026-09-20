-- Orchesterbereich: Instrumente, Probenhinweise des Dirigenten, Konzertablauf

ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS instrument text;

-- Der Dirigent bekommt einen eigenen Zugangscode, getrennt vom Begleitteam.
ALTER TABLE public.staff_access
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'begleiter'
    CHECK (kind IN ('begleiter','dirigent'));

INSERT INTO public.staff_access (code, label, kind)
SELECT 'BOH-MAESTRO-2026', 'Dirigent Japanreise', 'dirigent'
WHERE NOT EXISTS (
  SELECT 1 FROM public.staff_access WHERE code = 'BOH-MAESTRO-2026'
);

CREATE TABLE public.rehearsal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  piece text NOT NULL,
  measures text NOT NULL DEFAULT '',
  instruction text NOT NULL DEFAULT '',
  instruments text[] NOT NULL DEFAULT '{}',
  trip_day_id uuid REFERENCES public.trip_days(id) ON DELETE SET NULL,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.rehearsal_notes TO service_role;

ALTER TABLE public.rehearsal_notes ENABLE ROW LEVEL SECURITY;

CREATE INDEX rehearsal_notes_trip_idx
  ON public.rehearsal_notes (trip_id, created_at DESC);

CREATE TRIGGER rehearsal_notes_updated_at
  BEFORE UPDATE ON public.rehearsal_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.concerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title text NOT NULL,
  venue text NOT NULL DEFAULT '',
  starts_at timestamptz NOT NULL,
  meeting_at timestamptz,
  meeting_point text NOT NULL DEFAULT '',
  tuning_at timestamptz,
  dress text NOT NULL DEFAULT '',
  program text[] NOT NULL DEFAULT '{}',
  notes text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.concerts TO service_role;

ALTER TABLE public.concerts ENABLE ROW LEVEL SECURITY;

CREATE INDEX concerts_trip_idx
  ON public.concerts (trip_id, starts_at);

CREATE TRIGGER concerts_updated_at
  BEFORE UPDATE ON public.concerts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
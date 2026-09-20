CREATE TABLE public.prep_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  due_note text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.prep_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.prep_tasks(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'offen',
  note text NOT NULL DEFAULT '',
  updated_by text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, room_id)
);

GRANT ALL ON public.prep_tasks TO service_role;
GRANT ALL ON public.prep_status TO service_role;

ALTER TABLE public.prep_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_status ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER prep_tasks_set_updated_at BEFORE UPDATE ON public.prep_tasks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER prep_status_set_updated_at BEFORE UPDATE ON public.prep_status
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.prep_tasks (trip_id, title, description, due_note, sort_order)
SELECT t.id, v.title, v.description, v.due_note, v.sort_order
FROM public.trips t
CROSS JOIN (VALUES
  ('Restaurantreservierung', 'Wer isst wo mit? Bitte eintragen, sobald euer Zimmer die Angaben gemacht hat.', 'Vor der Reise', 1),
  ('Flugpassagierliste', 'Namen genau wie im Reisepass – bitte prüfen und bestätigen.', 'Vor der Reise', 2),
  ('Geschenke', 'Gastgeschenke besorgt und eingepackt?', 'Vor der Reise', 3)
) AS v(title, description, due_note, sort_order)
WHERE t.is_active = true;
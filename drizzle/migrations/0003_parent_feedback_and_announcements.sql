ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'alle';

CREATE TABLE IF NOT EXISTS public.parent_announcement_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  parent_code text NOT NULL,
  child_name text NOT NULL DEFAULT '',
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (announcement_id, parent_code)
);

GRANT ALL ON public.parent_announcement_reads TO service_role;
ALTER TABLE public.parent_announcement_reads ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.parent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid,
  parent_code text NOT NULL,
  child_name text NOT NULL DEFAULT '',
  room_number text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'feedback',
  body text NOT NULL,
  answer text NOT NULL DEFAULT '',
  answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.parent_messages TO service_role;
ALTER TABLE public.parent_messages ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER parent_messages_set_updated_at
  BEFORE UPDATE ON public.parent_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
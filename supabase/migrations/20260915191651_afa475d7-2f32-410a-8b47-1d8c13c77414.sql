CREATE TABLE public.outing_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid,
  trip_day_id uuid,
  day_number integer,
  day_date date,
  room_number text NOT NULL DEFAULT '',
  member_names text[] NOT NULL DEFAULT '{}'::text[],
  leave_time text NOT NULL DEFAULT '',
  return_time text NOT NULL DEFAULT '',
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT '',
  decision_note text NOT NULL DEFAULT '',
  event text NOT NULL,
  request_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT ALL ON public.outing_history TO service_role;
ALTER TABLE public.outing_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX outing_history_created_at_idx ON public.outing_history (created_at DESC);
CREATE TABLE public.outing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_day_id uuid NOT NULL REFERENCES public.trip_days(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  requester_participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  buddy_participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  leave_time text NOT NULL,
  return_time text NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  decision_note text,
  decided_at timestamptz,
  returned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT outing_requests_status_check CHECK (status IN ('pending','approved','rejected')),
  CONSTRAINT outing_requests_two_people CHECK (requester_participant_id <> buddy_participant_id)
);

GRANT ALL ON public.outing_requests TO service_role;

ALTER TABLE public.outing_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX outing_requests_day_idx ON public.outing_requests (trip_day_id);
CREATE INDEX outing_requests_room_idx ON public.outing_requests (room_id);

CREATE TRIGGER outing_requests_updated_at
BEFORE UPDATE ON public.outing_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
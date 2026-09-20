-- Zimmer-PIN: jedes Zimmer vergibt selbst eine 4-stellige Zahl
alter table public.rooms add column if not exists pin text;
alter table public.rooms add column if not exists pin_set_at timestamptz;

-- Zugriffsprotokoll: damit sichtbar bleibt, wer wann welches Zimmer geöffnet hat
-- und wo falsche PINs ausprobiert wurden
create table if not exists public.room_access_log (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete set null,
  access_code text not null,
  success boolean not null default false,
  reason text,
  device text,
  attempted_at timestamptz not null default now()
);
create index if not exists room_access_log_room_time_idx
  on public.room_access_log (room_id, attempted_at desc);
create index if not exists room_access_log_code_time_idx
  on public.room_access_log (access_code, attempted_at desc);
GRANT ALL ON public.room_access_log TO service_role;
revoke all on public.room_access_log from anon, authenticated;
ALTER TABLE public.room_access_log ENABLE ROW LEVEL SECURITY;

-- Einträge: Zeitpunkt der letzten Änderung + Gerät, damit Streiche nachvollziehbar bleiben
alter table public.daily_entries add column if not exists updated_at timestamptz not null default now();
alter table public.daily_entries add column if not exists submitted_from text;
-- Rollen
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Nutzer sehen eigene Rollen" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Erster registrierter Nutzer wird automatisch Organisator
create or replace function public.bootstrap_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created_bootstrap_admin
after insert on auth.users
for each row execute function public.bootstrap_first_admin();

-- Reise
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant all on public.trips to service_role;
alter table public.trips enable row level security;

create table public.trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_number int not null,
  day_date date not null,
  location text,
  activities jsonb not null default '[]'::jsonb,
  tomorrow_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (trip_id, day_number)
);
grant all on public.trip_days to service_role;
alter table public.trip_days enable row level security;

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  room_number text not null,
  nickname text,
  member_one text,
  member_two text,
  access_code text not null unique,
  created_at timestamptz not null default now(),
  unique (trip_id, room_number)
);
grant all on public.rooms to service_role;
alter table public.rooms enable row level security;

create table public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  trip_day_id uuid not null references public.trip_days(id) on delete cascade,
  mood_start int check (mood_start between 1 and 5),
  mood_end int check (mood_end between 1 and 5),
  activities text[] not null default '{}',
  main_memory text,
  main_memory_why text,
  culture_topic text,
  culture_text text,
  encounter boolean,
  encounter_text text,
  best_part text,
  challenge text,
  challenge_text text,
  tomorrow text,
  three_words text[] not null default '{}',
  creative_kind text,
  creative_text text,
  photo_path text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, trip_day_id)
);
grant all on public.daily_entries to service_role;
alter table public.daily_entries enable row level security;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
create trigger daily_entries_updated_at before update on public.daily_entries
for each row execute function public.set_updated_at();

create table public.story_picks (
  id uuid primary key default gen_random_uuid(),
  trip_day_id uuid not null references public.trip_days(id) on delete cascade,
  entry_id uuid not null references public.daily_entries(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now(),
  unique (trip_day_id, entry_id, kind)
);
grant all on public.story_picks to service_role;
alter table public.story_picks enable row level security;

-- Beispielreise
insert into public.trips (id, name, subtitle)
values ('11111111-1111-1111-1111-111111111111', 'Japan Journey', 'Kulturaustausch Tagebuch');

insert into public.trip_days (trip_id, day_number, day_date, location, activities, tomorrow_items)
select '11111111-1111-1111-1111-111111111111', d.n, (current_date - 3 + d.n)::date, d.loc,
  '[{"emoji":"🎵","label":"Musik"},{"emoji":"🎻","label":"Orchester / Probe"},{"emoji":"🎓","label":"Schule"},{"emoji":"🏯","label":"Kultur"},{"emoji":"🍜","label":"Essen"},{"emoji":"🚆","label":"Unterwegs"},{"emoji":"👥","label":"Neue Menschen"},{"emoji":"🏙️","label":"Stadt"},{"emoji":"🌳","label":"Natur"},{"emoji":"🛍️","label":"Shopping"},{"emoji":"😂","label":"Spaß"},{"emoji":"😴","label":"Anstrengend"},{"emoji":"🤯","label":"Etwas ganz Neues"}]'::jsonb,
  '["Probe","Stadterkundung","Schulbesuch","Tempel","Konzert"]'::jsonb
from (values (1,'Tokio'),(2,'Tokio'),(3,'Hakone'),(4,'Kyoto'),(5,'Kyoto'),(6,'Nara'),(7,'Osaka'),(8,'Osaka')) as d(n, loc);

insert into public.rooms (trip_id, room_number, access_code)
select '11111111-1111-1111-1111-111111111111', lpad(n::text, 2, '0'),
       'Z' || lpad(n::text, 2, '0') || '-' || upper(substr(md5(random()::text || n::text), 1, 4))
from generate_series(1, 30) as n;
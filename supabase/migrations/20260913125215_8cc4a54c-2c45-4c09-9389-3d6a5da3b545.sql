CREATE TABLE public.duty_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('reinigung','mittagessen')),
  trip_day_id uuid REFERENCES public.trip_days(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.duty_assignments TO service_role;

ALTER TABLE public.duty_assignments ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX duty_assignments_unique_day
  ON public.duty_assignments (participant_id, kind, trip_day_id)
  WHERE trip_day_id IS NOT NULL;

CREATE UNIQUE INDEX duty_assignments_unique_global
  ON public.duty_assignments (participant_id, kind)
  WHERE trip_day_id IS NULL;

CREATE TRIGGER duty_assignments_updated_at
  BEFORE UPDATE ON public.duty_assignments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

WITH plan(first_name, last_name, shr, lunch21, lunch22) AS (
  VALUES
  ('Miyuu','Aoki','Kl. 7a','Kl. 10A','Kl. 7a'),
  ('Maximilian','Roolvink','Kl. 7a','Kl. 10B','Kl. 7a'),
  ('Matteo','Mix','Kl. 7b','Kl. 10C','Kl. 7b'),
  ('Julika','Linke','Kl. 7b','Kl. 10D','Kl. 7b'),
  ('Mats','Lemke','Kl. 7c','Kl. 11A','Kl. 7c'),
  ('Philine','Wolf','Kl. 7c','Kl. 11A','Kl. 7c'),
  ('Johann','Klein','Kl. 7d','Kl. 11B','Kl. 7d'),
  ('Catharina','Splitt','Kl. 7d','Kl. 11B','Kl. 7d'),
  ('Mio','Uno','Kl. 8a','Kl. 11C','Kl. 8a'),
  ('Mats','Steffel','Kl. 8a','Kl. 11C','Kl. 8a'),
  ('Natsumi','Aoki','Kl. 8b','Kl. 11D','Kl. 8b'),
  ('Leyla','Al-Khawlany','Kl. 8b','Kl. 11D','Kl. 8b'),
  ('Jonas','Keil','Kl. 8c','Kl. 12A','Kl. 8c'),
  ('Evangelos','Masis','Kl. 8c','Kl. 12A','Kl. 8c'),
  ('Jasper','Benedix','Kl. 8d','Kl. 12B','Kl. 8d'),
  ('Nelly','Heinken','Kl. 8d','Kl. 12B','Kl. 8d'),
  ('Erik','Bach','Kl. 9a','Kl. 12C','Kl. 9a'),
  ('Kai','Schoenrock','Kl. 9a','Kl. 12C','Kl. 9a'),
  ('Max','Bolder','Kl. 9b','Kl. 12D','Kl. 9b'),
  ('Lennart','Hückstädt','Kl. 9b','Kl. 12D','Kl. 9b'),
  ('Luise','Montanus','Kl. 9c','Kl. 12E','Kl. 9c'),
  ('Konstantina-Yoana','Stefanova','Kl. 9c','Kl. 12E','Kl. 9c'),
  ('Karl','Fester','Kl. 9d','Kl. 121','Kl. 9d'),
  ('Johannes','Hauck','Kl. 9d','Kl. 121','Kl. 9d'),
  ('Karl','Otto','Kl. 10A','Kl. 10A','Kl. 7a'),
  ('Friederike','Specht','Kl. 10A','Kl. 10A','Kl. 7a'),
  ('Clara','Schüller','Kl. 10A','Kl. 10A','Kl. 7a'),
  ('Tess','Poulsen','Kl. 10B','Kl. 10B','Kl. 7b'),
  ('Sam','Piotraschke','Kl. 10B','Kl. 10B','Kl. 7b'),
  ('Rike','Wenz','Kl. 10B','Kl. 10B','Kl. 7b'),
  ('Luisa','Specker','Kl. 10C','Kl. 10C','Kl. 7c'),
  ('Luis','Hardt','Kl. 10C','Kl. 10C','Kl. 7c'),
  ('Lucas','Wunder','Kl. 10C','Kl. 10C','Kl. 7c'),
  ('Jens','Rondeck','Kl. 10D','Kl. 10D','Kl. 7d'),
  ('Helena','Kracke','Kl. 10D','Kl. 10D','Kl. 7d'),
  ('Elias','Jacobs','Kl. 10D','Kl. 10D','Kl. 7d'),
  ('Ares','Taskin','Kl. 11A','Kl. 11A','Kl. 8a'),
  ('Anne','Schemm','Kl. 11A','Kl. 11A','Kl. 8a'),
  ('Amalia','Masis','Kl. 11A','Kl. 11A','Kl. 8a'),
  ('Amadeus','Haase','Kl. 11B','Kl. 11B','Kl. 8b'),
  ('Tamina','Thebus','Kl. 11B','Kl. 11B','Kl. 8b'),
  ('Minh','Nguyen','Kl. 11B','Kl. 11B','Kl. 8b'),
  ('Mika','Vosgerau','Kl. 11C','Kl. 11C','Kl. 8c'),
  ('Max','Uhlhorn','Kl. 11C','Kl. 11C','Kl. 8c'),
  ('Marlene','Hauck','Kl. 11C','Kl. 11C','Kl. 8c'),
  ('Jonas','Hoesch','Kl. 11D','Kl. 11D','Kl. 8c'),
  ('Jo','Wanitschke','Kl. 11D','Kl. 11D','Kl. 8d'),
  ('Finn','Zeplin','Kl. 11D','Kl. 11D','Kl. 8d'),
  ('Clara','Borchard','Kl. 12A','Kl. 12A','Kl. 8d'),
  ('Cedric','Weißmüller','Kl. 12A','Kl. 12A','Kl. 8d'),
  ('Anisia','Kerdei','Kl. 12A','Kl. 12A','Kl. 9a'),
  ('Alisa','Burmeister','Kl. 12B','Kl. 12B','Kl. 9a'),
  ('Timur','Ucar','Kl. 12B','Kl. 12B','Kl. 9a'),
  ('Sofie','Lehmann','Kl. 12B','Kl. 12B','Kl. 9a'),
  ('Richard','Seidel','Kl. 12C','Kl. 12C','Kl. 9b'),
  ('Oskar','Dosse','Kl. 12C','Kl. 12C','Kl. 9b'),
  ('Maxim','Heinken','Kl. 12C','Kl. 12C','Kl. 9b'),
  ('Ludwig','Treppesch','Kl. 12D','Kl. 12D','Kl. 9b'),
  ('Lina','Schulze','Kl. 12D','Kl. 12D','Kl. 9c'),
  ('Lasse','Staschen','Kl. 12D','Kl. 12D','Kl. 9c'),
  ('Julie','Geller','Kl. 12E','Kl. 12E','Kl. 9c'),
  ('Ida','Coujad','Kl. 12E','Kl. 12E','Kl. 9c'),
  ('Helena','Kampe','Kl. 12E','Kl. 12E','Kl. 9d'),
  ('Hadrian','Ivanov','Kl. 121','Kl. 121','Kl. 9d'),
  ('Enno','Wenz','Kl. 121','Kl. 121','Kl. 9d'),
  ('Elisa','Große','Kl. 121','Kl. 121','Kl. 9d')
), matched AS (
  SELECT p.id AS participant_id, p.trip_id, plan.shr, plan.lunch21, plan.lunch22
  FROM plan
  JOIN public.participants p
    ON lower(p.last_name) = lower(plan.last_name)
   AND lower(split_part(p.first_name, ' ', 1)) = lower(plan.first_name)
), rows AS (
  SELECT participant_id, trip_id, 'reinigung'::text AS kind, NULL::uuid AS trip_day_id, shr AS label FROM matched
  UNION ALL
  SELECT m.participant_id, m.trip_id, 'mittagessen', d.id, m.lunch21
    FROM matched m JOIN public.trip_days d ON d.day_date = DATE '2026-10-21' AND d.trip_id = m.trip_id
  UNION ALL
  SELECT m.participant_id, m.trip_id, 'mittagessen', d.id, m.lunch22
    FROM matched m JOIN public.trip_days d ON d.day_date = DATE '2026-10-22' AND d.trip_id = m.trip_id
)
INSERT INTO public.duty_assignments (trip_id, participant_id, kind, trip_day_id, label)
SELECT trip_id, participant_id, kind, trip_day_id, label FROM rows;
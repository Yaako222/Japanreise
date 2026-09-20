-- 1) Alte Platzhalter-Zimmer der Reise entfernen
DELETE FROM public.story_picks WHERE entry_id IN (
  SELECT e.id FROM public.daily_entries e JOIN public.rooms r ON r.id = e.room_id
  WHERE r.trip_id = '11111111-1111-1111-1111-111111111111'
);
DELETE FROM public.daily_entries WHERE room_id IN (
  SELECT id FROM public.rooms WHERE trip_id = '11111111-1111-1111-1111-111111111111'
);
DELETE FROM public.room_access_log WHERE room_id IN (
  SELECT id FROM public.rooms WHERE trip_id = '11111111-1111-1111-1111-111111111111'
);
DELETE FROM public.rooms WHERE trip_id = '11111111-1111-1111-1111-111111111111';

-- 2) Die 12 echten Zimmer
INSERT INTO public.rooms (trip_id, room_number, nickname, access_code)
SELECT '11111111-1111-1111-1111-111111111111', v.no, v.nick,
       'Z' || lpad(v.no, 2, '0') || '-' || upper(substr(md5(random()::text || v.no), 1, 4))
FROM (VALUES
  ('1','Mädchen · Finnair'),
  ('2','Mädchen · SAS'),
  ('3','Mädchen · SAS'),
  ('4','Mädchen · Finnair'),
  ('5','Mädchen · SAS'),
  ('6','Jungen · SAS'),
  ('7','Jungen · Finnair'),
  ('8','Jungen · SAS'),
  ('9','Jungen · Finnair'),
  ('10','Jungen · Finnair'),
  ('11','Jungen · SAS'),
  ('12','Jungen · Finnair')
) AS v(no, nick);

-- 3) Teilnehmer
CREATE TABLE public.participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  flight text,
  age integer,
  phone text,
  parent_name text,
  parent_phone text,
  docs_complete boolean NOT NULL DEFAULT false,
  checkin_out boolean NOT NULL DEFAULT false,
  boarded_out boolean NOT NULL DEFAULT false,
  checkin_return boolean NOT NULL DEFAULT false,
  boarded_return boolean NOT NULL DEFAULT false,
  is_staff boolean NOT NULL DEFAULT false,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.participants TO service_role;
REVOKE ALL ON public.participants FROM anon, authenticated;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER participants_updated_at BEFORE UPDATE ON public.participants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX participants_trip_idx ON public.participants (trip_id);
CREATE INDEX participants_room_idx ON public.participants (room_id);

INSERT INTO public.participants (trip_id, room_id, first_name, last_name, flight, age, is_staff)
SELECT '11111111-1111-1111-1111-111111111111', r.id, v.fn, v.ln, v.fl, v.age, v.staff
FROM (VALUES
  ('1','Lina Valeska','Schulze','Finnair',18,false),
  ('1','Elisa Marie','Große','Finnair',18,false),
  ('1','Philine','Wolf','Finnair',23,false),
  ('1','Clara Charlotte','Borchard','Finnair',17,false),
  ('1','Alisa','Burmeister','Finnair',17,false),
  ('2','Tamina','Thebus','SAS',17,false),
  ('2','Marlene','Hauck','SAS',17,false),
  ('2','Sofie','Lehmann','SAS',18,false),
  ('2','Ida Vaike','Coujad','SAS',18,false),
  ('2','Catharina','Splitt','SAS',23,false),
  ('2','Julika Janine','Linke','SAS',25,false),
  ('3','Tess','Poulsen','SAS',16,false),
  ('3','Helena Maria','Kampe','SAS',18,false),
  ('3','Nelly','Heinken','SAS',15,false),
  ('3','Minh Anh','Nguyen','SAS',17,false),
  ('3','Anisia','Kerdei','SAS',17,false),
  ('3','Luise','Montanus','SAS',15,false),
  ('4','Julie Elise','Geller','Finnair',18,false),
  ('4','Clara Isabell','Schüller','Finnair',15,false),
  ('4','Helena','Kracke','Finnair',16,false),
  ('4','Rike','Wenz','Finnair',16,false),
  ('4','Anne Silja','Schemm','Finnair',16,false),
  ('4','Konstantina-Yoana','Stefanova','Finnair',19,false),
  ('5','Leyla','Al-Khawlany','SAS',14,false),
  ('5','Amalia Fay','Masis','SAS',16,false),
  ('5','Luisa','Specker','SAS',16,false),
  ('5','Miyuu','Aoki','SAS',12,false),
  ('5','Natsumi','Aoki','SAS',14,false),
  ('5','Friederike Johanna','Specht','SAS',15,false),
  ('6','Mats Lennart','Lemke','SAS',12,false),
  ('6','Maximilian Benedikt','Roolvink','SAS',12,false),
  ('6','Jasper Magnus','Benedix','SAS',14,false),
  ('6','Johann','Klein','SAS',12,false),
  ('6','Matteo','Mix','SAS',12,false),
  ('6','Mio','Uno','SAS',13,false),
  ('7','Ares Kuzey','Taskin','Finnair',16,false),
  ('7','Mats Anton','Steffel','Finnair',14,false),
  ('7','Karl Linus','Otto','Finnair',15,false),
  ('7','Evangelos Marlon','Masis','Finnair',23,false),
  ('7','Jonas','Hoesch','Finnair',17,false),
  ('7','Elias Leander','Jacobs','Finnair',16,false),
  ('8','Max','Bolder','SAS',15,false),
  ('8','Lennart','Hückstädt','SAS',22,false),
  ('8','Karl Maria','Fester','SAS',15,false),
  ('8','Luis','Hardt','SAS',16,false),
  ('8','Sam','Piotraschke','SAS',16,false),
  ('8','Amadeus','Haase','SAS',16,false),
  ('9','Jens Andreas','Rondeck','Finnair',16,false),
  ('9','Maxim','Heinken','Finnair',18,false),
  ('9','Jo','Wanitschke','Finnair',17,false),
  ('9','Oskar','Dosse','Finnair',18,false),
  ('9','Ludwig','Treppesch','Finnair',18,false),
  ('9','Max Alexander','Falcon Uhlhorn','Finnair',17,false),
  ('10','Kai Felix','Schoenrock','Finnair',21,false),
  ('10','Lasse','Staschen','Finnair',18,false),
  ('10','Richard','Seidel','Finnair',18,false),
  ('10','Jonas','Keil','Finnair',14,false),
  ('10','Hadrian Stanislav','Ivanov','Finnair',18,false),
  ('10','Johannes Alexander','Hauck','Finnair',15,false),
  ('11','Mika','Vosgerau','SAS',17,false),
  ('11','Finn','Zeplin','SAS',17,false),
  ('11','Cedric Marian','Weißmüller','SAS',17,false),
  ('11','Lucas','Wunder','SAS',NULL,false),
  ('12','Timur Anatol','Ucar','Finnair',18,false),
  ('12','Erik','Bach','Finnair',19,false),
  ('12','Enno','Wenz','Finnair',18,false),
  (NULL,'Gladys Cristina','Braga Ulloa','Finnair',NULL,true),
  (NULL,'Jesús López','Carmona','Finnair',NULL,true),
  (NULL,'Takashi','Aoki','SAS',NULL,true)
) AS v(room_no, fn, ln, fl, age, staff)
LEFT JOIN public.rooms r
  ON r.trip_id = '11111111-1111-1111-1111-111111111111'
 AND r.room_number = v.room_no;

-- 4) Tagesstatus pro Person
CREATE TABLE public.participant_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_day_id uuid NOT NULL REFERENCES public.trip_days(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  excused boolean NOT NULL DEFAULT false,
  buddy_participant_id uuid REFERENCES public.participants(id) ON DELETE SET NULL,
  returned boolean NOT NULL DEFAULT false,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trip_day_id, participant_id)
);
GRANT ALL ON public.participant_days TO service_role;
REVOKE ALL ON public.participant_days FROM anon, authenticated;
ALTER TABLE public.participant_days ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER participant_days_updated_at BEFORE UPDATE ON public.participant_days
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX participant_days_day_idx ON public.participant_days (trip_day_id);
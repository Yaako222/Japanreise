ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS parent_access_code text;

CREATE UNIQUE INDEX IF NOT EXISTS participants_parent_access_code_key
  ON public.participants (parent_access_code)
  WHERE parent_access_code IS NOT NULL;

UPDATE public.participants
SET parent_access_code = upper(substr(md5(id::text || clock_timestamp()::text || random()::text), 1, 8))
WHERE is_staff = false
  AND parent_access_code IS NULL;

ALTER TABLE public.participants
  ADD CONSTRAINT participants_parent_access_code_format
  CHECK (parent_access_code IS NULL OR parent_access_code ~ '^[A-Z0-9]{8}$');
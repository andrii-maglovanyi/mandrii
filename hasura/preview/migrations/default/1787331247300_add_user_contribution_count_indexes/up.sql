-- Authoritative profile contribution counts filter by creator and status.
CREATE INDEX IF NOT EXISTS venues_user_id_status_idx
  ON public.venues (user_id, status);

CREATE INDEX IF NOT EXISTS events_user_id_status_idx
  ON public.events (user_id, status);

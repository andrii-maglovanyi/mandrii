ALTER TABLE public.community_requests
  DROP CONSTRAINT community_requests_body_check,
  ADD CONSTRAINT community_requests_body_check CHECK (char_length(btrim(body)) BETWEEN 5 AND 1500);

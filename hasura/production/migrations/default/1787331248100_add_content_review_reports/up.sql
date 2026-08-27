CREATE TABLE public.content_review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_rating_id uuid NOT NULL REFERENCES public.content_ratings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 3 AND 500),
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT content_review_reports_user_review_key UNIQUE (content_rating_id, user_id)
);

CREATE INDEX content_review_reports_open_idx ON public.content_review_reports (created_at DESC) WHERE status = 'OPEN';

CREATE TABLE public.review_telegram_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_rating_id uuid NOT NULL UNIQUE REFERENCES public.content_ratings(id) ON DELETE CASCADE,
  telegram_chat_id bigint NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT NOW(),
  locked_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  delivered_at timestamptz
);

CREATE INDEX review_telegram_deliveries_due_idx ON public.review_telegram_deliveries (next_attempt_at) WHERE status = 'PENDING';

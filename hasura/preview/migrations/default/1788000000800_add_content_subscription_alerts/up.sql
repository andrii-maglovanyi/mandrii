CREATE TABLE public.content_subscription_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.content_subscriptions(id) ON DELETE SET NULL,
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  content_update_id uuid REFERENCES public.content_updates(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('CONTENT_UPDATE', 'EVENT_PUBLISHED')),
  title text NOT NULL,
  body text,
  href text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  CHECK (
    (kind = 'CONTENT_UPDATE' AND content_update_id IS NOT NULL)
    OR (kind = 'EVENT_PUBLISHED' AND event_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX content_subscription_alerts_update_recipient_key
  ON public.content_subscription_alerts (recipient_id, content_update_id)
  WHERE content_update_id IS NOT NULL;

CREATE UNIQUE INDEX content_subscription_alerts_event_published_recipient_key
  ON public.content_subscription_alerts (recipient_id, event_id, kind)
  WHERE kind = 'EVENT_PUBLISHED';

CREATE INDEX content_subscription_alerts_recipient_idx
  ON public.content_subscription_alerts (recipient_id, read_at, created_at DESC);

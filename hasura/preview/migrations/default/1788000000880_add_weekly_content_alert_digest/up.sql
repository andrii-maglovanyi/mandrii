-- Weekly delivery uses the same durable queue as immediate and daily alerts.
-- Keeping the scheduling decision in SQL means trigger inserts and preference
-- changes always agree, regardless of the app server timezone.
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_content_alert_delivery_frequency_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_content_alert_delivery_frequency_check
    CHECK (content_alert_delivery_frequency IN ('IMMEDIATE', 'DAILY', 'WEEKLY'));

CREATE OR REPLACE FUNCTION public.content_alert_delivery_next_attempt_at(delivery_frequency text)
RETURNS timestamptz
LANGUAGE sql
STABLE
AS $$
  SELECT CASE delivery_frequency
    WHEN 'DAILY' THEN (
      date_trunc('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '9 hours'
        + CASE
            WHEN NOW() AT TIME ZONE 'UTC' >= date_trunc('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '9 hours'
              THEN INTERVAL '1 day'
            ELSE INTERVAL '0 days'
          END
    ) AT TIME ZONE 'UTC'
    WHEN 'WEEKLY' THEN (
      date_trunc('week', NOW() AT TIME ZONE 'UTC') + INTERVAL '9 hours'
        + CASE
            WHEN NOW() AT TIME ZONE 'UTC' >= date_trunc('week', NOW() AT TIME ZONE 'UTC') + INTERVAL '9 hours'
              THEN INTERVAL '7 days'
            ELSE INTERVAL '0 days'
          END
    ) AT TIME ZONE 'UTC'
    ELSE NOW()
  END;
$$;

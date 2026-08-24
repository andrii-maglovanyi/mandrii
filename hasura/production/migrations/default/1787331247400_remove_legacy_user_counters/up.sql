-- Contribution totals are calculated from their authoritative tables. These
-- denormalised counters had no reliable decrement/reconciliation path.
ALTER TABLE public.users
  DROP COLUMN venues_created,
  DROP COLUMN events_created,
  DROP COLUMN reviews_created,
  DROP COLUMN thank_you_count;

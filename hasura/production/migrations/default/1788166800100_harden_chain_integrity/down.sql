ALTER TABLE public.venues DROP CONSTRAINT IF EXISTS venues_chain_id_fkey;
ALTER TABLE public.chains DROP CONSTRAINT IF EXISTS chains_chain_id_fkey;
DROP INDEX IF EXISTS public.idx_chains_chain_id;

CREATE OR REPLACE FUNCTION public.assert_chain_hierarchy_is_acyclic()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  creates_cycle boolean;
BEGIN
  IF NEW.chain_id IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('venue-chain-hierarchy'));

  IF NEW.id = NEW.chain_id THEN
    RAISE EXCEPTION 'A chain cannot be its own parent';
  END IF;

  WITH RECURSIVE ancestors AS (
    SELECT id, chain_id FROM public.chains WHERE id = NEW.chain_id
    UNION
    SELECT parent.id, parent.chain_id
    FROM public.chains parent
    JOIN ancestors ancestor ON parent.id = ancestor.chain_id
  )
  SELECT EXISTS(SELECT 1 FROM ancestors WHERE id = NEW.id) INTO creates_cycle;

  IF creates_cycle THEN
    RAISE EXCEPTION 'A chain cannot be placed inside one of its descendants';
  END IF;

  RETURN NEW;
END;
$$;

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

DROP TRIGGER IF EXISTS chains_prevent_cycles ON public.chains;
CREATE TRIGGER chains_prevent_cycles
BEFORE INSERT OR UPDATE OF chain_id ON public.chains
FOR EACH ROW
EXECUTE FUNCTION public.assert_chain_hierarchy_is_acyclic();

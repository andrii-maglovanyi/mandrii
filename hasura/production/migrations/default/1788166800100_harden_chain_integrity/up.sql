-- Repair legacy dangling references before making relationships database-enforced.
UPDATE public.chains AS child
SET chain_id = NULL
WHERE child.chain_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.chains AS parent WHERE parent.id = child.chain_id);

UPDATE public.venues AS venue
SET chain_id = NULL
WHERE venue.chain_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.chains AS chain WHERE chain.id = venue.chain_id);

ALTER TABLE public.chains
  ADD CONSTRAINT chains_chain_id_fkey
  FOREIGN KEY (chain_id) REFERENCES public.chains(id) ON DELETE SET NULL;

ALTER TABLE public.venues
  ADD CONSTRAINT venues_chain_id_fkey
  FOREIGN KEY (chain_id) REFERENCES public.chains(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_chains_chain_id ON public.chains(chain_id);

CREATE OR REPLACE FUNCTION public.assert_chain_hierarchy_is_acyclic()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  child_depth integer;
  creates_cycle boolean;
  parent_depth integer;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.chain_id IS NOT DISTINCT FROM OLD.chain_id THEN
    RETURN NEW;
  END IF;

  IF NEW.chain_id IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('venue-chain-hierarchy'));

  IF NEW.id = NEW.chain_id THEN
    RAISE EXCEPTION 'A chain cannot be its own parent';
  END IF;

  WITH RECURSIVE ancestors AS (
    SELECT id, chain_id, ARRAY[id] AS path
    FROM public.chains
    WHERE id = NEW.chain_id
    UNION ALL
    SELECT parent.id, parent.chain_id, ancestor.path || parent.id
    FROM public.chains AS parent
    JOIN ancestors AS ancestor ON parent.id = ancestor.chain_id
    WHERE NOT parent.id = ANY(ancestor.path)
  )
  SELECT COUNT(*)::integer, EXISTS(SELECT 1 FROM ancestors WHERE id = NEW.id)
  INTO parent_depth, creates_cycle
  FROM ancestors;

  IF parent_depth = 0 THEN
    RAISE EXCEPTION 'A chain parent must exist';
  END IF;

  IF creates_cycle THEN
    RAISE EXCEPTION 'A chain cannot be placed inside one of its descendants';
  END IF;

  WITH RECURSIVE descendants AS (
    SELECT id, 0::integer AS depth, ARRAY[id] AS path
    FROM public.chains
    WHERE id = NEW.id
    UNION ALL
    SELECT child.id, descendant.depth + 1, descendant.path || child.id
    FROM public.chains AS child
    JOIN descendants AS descendant ON child.chain_id = descendant.id
    WHERE NOT child.id = ANY(descendant.path)
  )
  SELECT COALESCE(MAX(depth), 0)::integer
  INTO child_depth
  FROM descendants;

  IF parent_depth + 1 + child_depth > 2 THEN
    RAISE EXCEPTION 'A chain hierarchy supports a brand and one local branch level';
  END IF;

  RETURN NEW;
END;
$$;

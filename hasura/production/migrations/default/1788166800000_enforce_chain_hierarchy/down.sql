DROP TRIGGER IF EXISTS chains_prevent_cycles ON public.chains;
DROP FUNCTION IF EXISTS public.assert_chain_hierarchy_is_acyclic();

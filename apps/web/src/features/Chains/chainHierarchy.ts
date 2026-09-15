export type ChainHierarchyNode = {
  chain_id: null | string;
  id: string;
};

export const MAX_CHAIN_DEPTH = 2;

/** Returns a chain and every chain below it, with duplicate-safe traversal. */
export function getDescendantChainIds(chains: ChainHierarchyNode[], rootId: string) {
  const descendants = new Set<string>([rootId]);
  const pending = [rootId];

  while (pending.length > 0) {
    const parentId = pending.pop();
    for (const chain of chains) {
      if (chain.chain_id !== parentId || descendants.has(chain.id)) continue;
      descendants.add(chain.id);
      pending.push(chain.id);
    }
  }

  return descendants;
}

function getChainDepth(chains: ChainHierarchyNode[], chainId: string) {
  const chainsById = new Map(chains.map((chain) => [chain.id, chain]));
  const visited = new Set<string>();
  let currentId: null | string = chainId;
  let depth = 0;

  while (currentId) {
    if (visited.has(currentId)) return Number.POSITIVE_INFINITY;
    visited.add(currentId);
    depth += 1;
    currentId = chainsById.get(currentId)?.chain_id ?? null;
  }

  return depth;
}

function getSubtreeHeight(chains: ChainHierarchyNode[], rootId: string) {
  const childrenByParentId = new Map<string, string[]>();
  for (const chain of chains) {
    if (!chain.chain_id) continue;
    const children = childrenByParentId.get(chain.chain_id) ?? [];
    children.push(chain.id);
    childrenByParentId.set(chain.chain_id, children);
  }

  const visit = (chainId: string, visited: Set<string>): number => {
    if (visited.has(chainId)) return Number.POSITIVE_INFINITY;
    const nextVisited = new Set(visited).add(chainId);
    return Math.max(0, ...(childrenByParentId.get(chainId) ?? []).map((childId) => 1 + visit(childId, nextVisited)));
  };

  return visit(rootId, new Set());
}

/** A parent cannot create a cycle or exceed the public two-level chain model. */
export function getEligibleParentChainIds(chains: ChainHierarchyNode[], chainId: string | null) {
  const excludedIds = chainId ? getDescendantChainIds(chains, chainId) : new Set<string>();
  const subtreeHeight = chainId ? getSubtreeHeight(chains, chainId) : 0;

  return new Set(
    chains
      .filter(
        (chain) =>
          !excludedIds.has(chain.id) &&
          getChainDepth(chains, chain.id) + 1 + subtreeHeight <= MAX_CHAIN_DEPTH,
      )
      .map((chain) => chain.id),
  );
}

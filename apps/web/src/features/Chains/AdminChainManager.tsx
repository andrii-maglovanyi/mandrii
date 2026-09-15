"use client";

import { ChevronDown, ChevronRight, CirclePlus, GitBranch, MapPin, Store } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ChainSummary as Chain, ChainDetails, ChainVenue as Venue } from "~/lib/chains/types";

import { ActionButton, Button, Input, SectionCard, Select } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";

import { getEligibleParentChainIds } from "./chainHierarchy";
import { ChainVenuePicker } from "./ChainVenuePicker";
import { formatChainLocation } from "./formatChainLocation";

type ChainDraft = {
  city: string;
  country: string;
  id: null | string;
  name: string;
  parentChainId: null | string;
  slug: string;
  venueIds: string[];
};

const emptyDraft = (): ChainDraft => ({
  city: "",
  country: "",
  id: null,
  name: "",
  parentChainId: null,
  slug: "",
  venueIds: [],
});

function categoryIcon(category: null | string, fallback: React.ReactNode, size = 18) {
  const categoryConfig = category ? constants.categories[category as keyof typeof constants.categories] : null;
  return categoryConfig ? getIcon(categoryConfig.iconName, { size }) : fallback;
}

export const AdminChainManager = () => {
  const i18n = useI18n();
  const { showError, showSuccess } = useNotifications();
  const [chains, setChains] = useState<Chain[]>([]);
  const [draft, setDraft] = useState<ChainDraft>(emptyDraft);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChain, setIsLoadingChain] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [expandedChainIds, setExpandedChainIds] = useState<Set<string>>(new Set());
  const [loadingTreeVenueIds, setLoadingTreeVenueIds] = useState<Set<string>>(new Set());
  const [venueQuery, setVenueQuery] = useState("");
  const [venueResults, setVenueResults] = useState<Venue[]>([]);
  const [selectedVenueDetails, setSelectedVenueDetails] = useState<Venue[]>([]);
  const [venuesByChainId, setVenuesByChainId] = useState<Record<string, Venue[]>>({});
  const [isSearchingVenues, setIsSearchingVenues] = useState(false);
  const requestVersion = useRef(0);
  const treeRequests = useRef(new Map<string, symbol>());

  const loadChains = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/chains", { cache: "no-store" });
      const result = (await response.json()) as { chains?: Chain[]; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to load venue chains");
      setChains(result.chains ?? []);
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to load venue chains"));
    } finally {
      setIsLoading(false);
    }
  }, [i18n, showError]);

  useEffect(() => void loadChains(), [loadChains]);

  const loadChain = useCallback(
    async (chainId: string) => {
      const version = ++requestVersion.current;
      setIsLoadingChain(true);
      try {
        const response = await fetch(`/api/admin/chains/${chainId}`, { cache: "no-store" });
        const result = (await response.json()) as { chain?: ChainDetails; error?: string; venues?: Venue[] };
        if (!response.ok || !result.chain) throw new Error(result.error ?? "Unable to load this chain");
        if (version !== requestVersion.current) return;
        setDraft({
          city: result.chain.city ?? "",
          country: result.chain.country ?? "",
          id: result.chain.id,
          name: result.chain.name,
          parentChainId: result.chain.chain_id,
          slug: result.chain.slug,
          venueIds: (result.venues ?? []).map((venue) => venue.id),
        });
        setVenueResults(result.venues ?? []);
        setSelectedVenueDetails(result.venues ?? []);
        setVenuesByChainId((current) => ({ ...current, [chainId]: result.venues ?? [] }));
        setVenueQuery("");
      } catch (error) {
        if (version === requestVersion.current) {
          showError(error instanceof Error ? error.message : i18n("Unable to load this chain"));
        }
      } finally {
        if (version === requestVersion.current) setIsLoadingChain(false);
      }
    },
    [i18n, showError],
  );

  const loadTreeVenues = useCallback(
    async (chainId: string) => {
      if (venuesByChainId[chainId] !== undefined || treeRequests.current.has(chainId)) return;
      const request = Symbol(chainId);
      treeRequests.current.set(chainId, request);
      setLoadingTreeVenueIds((current) => new Set(current).add(chainId));
      try {
        const response = await fetch(`/api/admin/chains/${chainId}`, { cache: "no-store" });
        const result = (await response.json()) as { error?: string; venues?: Venue[] };
        if (treeRequests.current.get(chainId) !== request) return;
        if (!response.ok) throw new Error(result.error ?? "Unable to load chain venues");
        setVenuesByChainId((current) => ({ ...current, [chainId]: result.venues ?? [] }));
      } catch (error) {
        if (treeRequests.current.get(chainId) === request) {
          showError(error instanceof Error ? error.message : i18n("Unable to load chain venues"));
        }
      } finally {
        if (treeRequests.current.get(chainId) === request) {
          treeRequests.current.delete(chainId);
          setLoadingTreeVenueIds((current) => {
            const next = new Set(current);
            next.delete(chainId);
            return next;
          });
        }
      }
    },
    [i18n, showError, venuesByChainId],
  );

  useEffect(() => {
    const normalizedQuery = venueQuery.trim();
    if (normalizedQuery.length < 2) {
      setIsSearchingVenues(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsSearchingVenues(true);
      try {
        const response = await fetch(`/api/admin/chains/venues?q=${encodeURIComponent(normalizedQuery)}`, {
          signal: controller.signal,
        });
        const result = (await response.json()) as { error?: string; venues?: Venue[] };
        if (!response.ok) throw new Error(result.error ?? "Unable to search venues");
        setVenueResults(result.venues ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          showError(error instanceof Error ? error.message : i18n("Unable to search venues"));
        }
      } finally {
        if (!controller.signal.aborted) setIsSearchingVenues(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [i18n, showError, venueQuery]);

  const visibleChainIds = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return new Set(chains.map((chain) => chain.id));

    const chainsById = new Map(chains.map((chain) => [chain.id, chain]));
    const visibleIds = new Set(
      chains
        .filter((chain) =>
          `${chain.name} ${chain.slug} ${formatChainLocation(chain)}`.toLocaleLowerCase().includes(normalized),
        )
        .map((chain) => chain.id),
    );

    for (const chainId of [...visibleIds]) {
      let parentId = chainsById.get(chainId)?.chain_id;
      while (parentId && !visibleIds.has(parentId)) {
        visibleIds.add(parentId);
        parentId = chainsById.get(parentId)?.chain_id;
      }
    }

    return visibleIds;
  }, [chains, query]);

  const chainsById = useMemo(() => new Map(chains.map((chain) => [chain.id, chain])), [chains]);
  const childChainsByParentId = useMemo(() => {
    const result = new Map<string, Chain[]>();
    for (const chain of chains) {
      if (!chain.chain_id) continue;
      const children = result.get(chain.chain_id) ?? [];
      children.push(chain);
      result.set(chain.chain_id, children);
    }
    return result;
  }, [chains]);
  const rootChains = useMemo(
    () => chains.filter((chain) => !chain.chain_id || !chainsById.has(chain.chain_id)),
    [chains, chainsById],
  );
  const eligibleParentIds = useMemo(() => getEligibleParentChainIds(chains, draft.id), [chains, draft.id]);
  const parentOptions = useMemo(
    () => [
      { label: i18n("No parent chain"), value: "" },
      ...chains
        .filter((chain) => eligibleParentIds.has(chain.id))
        .map((chain) => ({ label: chain.name, value: chain.id })),
    ],
    [chains, eligibleParentIds, i18n],
  );

  const selectedVenueIds = useMemo(() => new Set(draft.venueIds), [draft.venueIds]);
  const selectedVenues = useMemo(
    () => selectedVenueDetails.filter((venue) => selectedVenueIds.has(venue.id)),
    [selectedVenueDetails, selectedVenueIds],
  );

  const startNew = () => {
    requestVersion.current += 1;
    setIsLoadingChain(false);
    setDraft(emptyDraft());
    setVenueQuery("");
    setVenueResults([]);
    setSelectedVenueDetails([]);
  };

  const setField = <K extends keyof ChainDraft>(field: K, value: ChainDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const toggleVenue = (venueId: string) => {
    setDraft((current) => ({
      ...current,
      venueIds: current.venueIds.includes(venueId)
        ? current.venueIds.filter((id) => id !== venueId)
        : [...current.venueIds, venueId],
    }));
    setSelectedVenueDetails((current) => {
      if (current.some((venue) => venue.id === venueId)) return current.filter((venue) => venue.id !== venueId);
      const venue = venueResults.find((candidate) => candidate.id === venueId);
      return venue ? [...current, venue] : current;
    });
  };

  const toggleTreeChain = (chain: Chain) => {
    const willExpand = !expandedChainIds.has(chain.id);
    setExpandedChainIds((current) => {
      const next = new Set(current);
      if (next.has(chain.id)) next.delete(chain.id);
      else next.add(chain.id);
      return next;
    });
    if (willExpand && chain.venue_count > 0) void loadTreeVenues(chain.id);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving || !draft.name.trim()) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/chains", {
        body: JSON.stringify({ ...draft, id: draft.id ?? undefined, name: draft.name.trim() }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as { chain?: ChainDetails; error?: string };
      if (!response.ok || !result.chain) throw new Error(result.error ?? "Unable to save this chain");
      treeRequests.current.clear();
      setLoadingTreeVenueIds(new Set());
      setVenuesByChainId({});
      setExpandedChainIds(new Set());
      await loadChains();
      const saved = result.chain;
      setDraft((current) => ({
        ...current,
        city: saved.city ?? "",
        country: saved.country ?? "",
        id: saved.id,
        name: saved.name,
        parentChainId: saved.chain_id,
        slug: saved.slug,
      }));
      setVenueQuery("");
      setVenueResults([]);
      showSuccess(draft.id ? i18n("Chain updated") : i18n("Chain created"));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to save this chain"));
    } finally {
      setIsSaving(false);
    }
  };

  const renderChainTree = (chain: Chain, depth = 0): React.ReactNode => {
    if (!visibleChainIds.has(chain.id)) return null;

    const childChains = (childChainsByParentId.get(chain.id) ?? []).filter((child) => visibleChainIds.has(child.id));
    const hasChildren = childChains.length > 0 || chain.venue_count > 0;
    const isExpanded = expandedChainIds.has(chain.id) || (query.trim().length > 0 && childChains.length > 0);
    const treeVenues = venuesByChainId[chain.id] ?? [];
    const isLoadingVenues = loadingTreeVenueIds.has(chain.id);

    return (
      <li key={chain.id}>
        <div
          className={`
            flex min-h-14 items-center gap-2 pr-3 transition-colors
            ${
            draft.id === chain.id ? "bg-primary/10" : "hover:bg-surface-tint"
          }
          `}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {hasChildren ? (
            <ActionButton
              aria-label={
                isExpanded
                  ? i18n("Collapse {chain}", { chain: chain.name })
                  : i18n("Expand {chain}", { chain: chain.name })
              }
              disabled={isSaving}
              icon={isExpanded ? <ChevronDown aria-hidden size={18} /> : <ChevronRight aria-hidden size={18} />}
              onClick={() => toggleTreeChain(chain)}
              size="sm"
              tooltipPosition="right"
              variant="ghost"
            />
          ) : (
            <span aria-hidden className="size-8 shrink-0" />
          )}
          <Button
            className={`
              min-h-11 min-w-0 flex-1 justify-start gap-3 bg-transparent px-0
              py-2 text-left whitespace-normal
              hover:bg-transparent
            `}
            color="neutral"
            disabled={isSaving}
            onClick={() => void loadChain(chain.id)}
            variant="ghost"
          >
            <span className={`
              flex size-9 shrink-0 items-center justify-center rounded-lg
              bg-primary/10 text-primary
            `}>
              {categoryIcon(chain.display_category, <GitBranch aria-hidden size={18} />)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{chain.name}</span>
              <span className="block truncate text-sm text-neutral">
                {i18n("{count} venues", { count: chain.venue_count })}
                {childChains.length > 0 && ` · ${i18n("{count} groups", { count: childChains.length })}`}
              </span>
            </span>
          </Button>
        </div>
        {isExpanded && (
          <ul>
            {childChains.map((child) => renderChainTree(child, depth + 1))}
            {isLoadingVenues && <li className="px-5 py-3 text-sm text-neutral">{i18n("Loading venues…")}</li>}
            {!isLoadingVenues &&
              treeVenues.map((venue) => (
                <li key={venue.id}>
                  <Link
                    className={`
                      flex min-h-12 items-center gap-3 px-4 py-2
                      transition-colors
                      hover:bg-surface-tint
                    `}
                    href={`/venues/${venue.slug}`}
                    style={{ paddingLeft: `${48 + depth * 16}px` }}
                  >
                    <span className={`
                      flex size-7 shrink-0 items-center justify-center
                      text-primary
                    `}>
                      {categoryIcon(venue.category, <MapPin aria-hidden size={17} />, 17)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{venue.name}</span>
                      <span className="block truncate text-xs text-neutral">
                        {formatChainLocation(venue) || i18n("No location set")}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <main className="w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={`
            flex items-center gap-2 text-sm font-semibold tracking-wide
            text-primary uppercase
          `}>
            <GitBranch aria-hidden size={16} />
            {i18n("Venue structure")}
          </p>
          <h1 className="mt-1 text-3xl font-semibold">{i18n("Venue chains")}</h1>
          <p className="mt-1 max-w-2xl text-neutral">
            {i18n("Create brand groups, add local branches, and assign venues without losing the structure.")}
          </p>
        </div>
        <Button disabled={isSaving} onClick={startNew}>
          <CirclePlus aria-hidden size={18} />
          {i18n("New chain")}
        </Button>
      </div>

      <div className={`
        grid items-start gap-6
        lg:grid-cols-[minmax(18rem,0.65fr)_minmax(0,1.35fr)]
      `}>
        <section aria-labelledby="all-chains-heading" className="lg:pr-2">
          <div className="pb-4">
            <h2 className="text-xl font-semibold" id="all-chains-heading">
              {i18n("All chains")}
            </h2>
            <p className="mt-1 text-sm text-neutral">
              {i18n("Expand a chain to browse its local venues and branches.")}
            </p>
            <div className="mt-4">
              <Input
                aria-label={i18n("Search chains")}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={i18n("Search by chain, city, or country")}
                type="search"
                value={query}
              />
            </div>
          </div>
          <div className={`
            max-h-[40rem] overflow-y-auto border-t border-on-surface/10
          `}>
            {isLoading ? (
              <p className="px-4 py-8 text-sm text-neutral">{i18n("Loading chains…")}</p>
            ) : chains.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-10 text-center">
                <span className={`
                  flex size-12 items-center justify-center rounded-full
                  bg-primary/10 text-primary
                `}>
                  <GitBranch aria-hidden size={22} />
                </span>
                <h3 className="mt-4 font-semibold">{i18n("No venue chains yet")}</h3>
                <p className="mt-1 max-w-xs text-sm text-neutral">
                  {i18n("Create your first brand group in the editor, then add its venues or local branches.")}
                </p>
              </div>
            ) : visibleChainIds.size === 0 ? (
              <p className="px-4 py-8 text-sm text-neutral">{i18n("No chains match this search.")}</p>
            ) : (
              <ul>{rootChains.map((chain) => renderChainTree(chain))}</ul>
            )}
          </div>
        </section>

        <SectionCard className="min-h-[30rem]" title={draft.id ? i18n("Edit chain") : i18n("Create a chain")}>
          {isLoadingChain ? (
            <p className="py-16 text-center text-neutral">{i18n("Loading chain details…")}</p>
          ) : (
            <form aria-label={i18n("Venue chains")} onSubmit={(event) => void save(event)}>
              <fieldset className="space-y-6 pt-4" disabled={isSaving}>
                <div className={`
                  grid gap-4
                  sm:grid-cols-2
                `}>
                  <Input
                    label={i18n("Chain name")}
                    onChange={(event) => setField("name", event.target.value)}
                    placeholder={i18n("For example, Puzata Hata")}
                    required
                    value={draft.name}
                  />
                  <Input
                    label={i18n("Slug")}
                    onChange={(event) => setField("slug", event.target.value)}
                    placeholder={i18n("Generated from the name if left empty")}
                    value={draft.slug}
                  />
                  <Input
                    label={i18n("Country")}
                    onChange={(event) => setField("country", event.target.value)}
                    placeholder={i18n("For example, Ukraine")}
                    value={draft.country}
                  />
                  <Input
                    label={i18n("City or region")}
                    onChange={(event) => setField("city", event.target.value)}
                    placeholder={i18n("Optional")}
                    value={draft.city}
                  />
                </div>

                <div className="border-t border-on-surface/10 pt-5">
                  <p className="font-semibold">{i18n("Place in the hierarchy")}</p>
                  <p className="mt-1 text-sm text-neutral">
                    {i18n("Add one local branch beneath a brand. Circular or deeper hierarchies are blocked.")}
                  </p>
                  <div className="mt-3 max-w-xl">
                    <Select
                      label={i18n("Parent chain")}
                      onChange={(event) => setField("parentChainId", event.target.value || null)}
                      options={parentOptions}
                      searchable
                      searchPlaceholder={i18n("Search parent chains")}
                      value={draft.parentChainId ?? ""}
                    />
                  </div>
                </div>

                <ChainVenuePicker
                  chainsById={chainsById}
                  isSearchingVenues={isSearchingVenues}
                  selectedVenueIds={selectedVenueIds}
                  selectedVenues={selectedVenues}
                  setVenueQuery={setVenueQuery}
                  toggleVenue={toggleVenue}
                  venueQuery={venueQuery}
                  venueResults={venueResults}
                />

                <div className={`
                  flex flex-wrap justify-end gap-3 border-t border-on-surface/10
                  pt-5
                `}>
                  {draft.id && (
                    <Button disabled={isSaving} onClick={startNew} variant="ghost">
                      {i18n("Create another chain")}
                    </Button>
                  )}
                  <Button busy={isSaving} type="submit">
                    <Store aria-hidden size={18} />
                    {draft.id ? i18n("Save changes") : i18n("Create chain")}
                  </Button>
                </div>
              </fieldset>
            </form>
          )}
        </SectionCard>
      </div>
    </main>
  );
};

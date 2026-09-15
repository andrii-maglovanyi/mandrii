import { X } from "lucide-react";
import { ActionButton, Checkbox, Input } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import type { ChainSummary, ChainVenue } from "~/lib/chains/types";
import { formatChainLocation } from "./formatChainLocation";

type ChainVenuePickerProps = {
  chainsById: Map<string, ChainSummary>;
  isSearchingVenues: boolean;
  selectedVenueIds: Set<string>;
  selectedVenues: ChainVenue[];
  setVenueQuery: (query: string) => void;
  toggleVenue: (id: string) => void;
  venueQuery: string;
  venueResults: ChainVenue[];
};

/** Venue assignment controls are separate from loading and saving the chain. */
export function ChainVenuePicker({ chainsById, isSearchingVenues, selectedVenueIds, selectedVenues, setVenueQuery, toggleVenue, venueQuery, venueResults }: ChainVenuePickerProps) {
  const i18n = useI18n();
  return (<div className="border-t border-on-surface/10 pt-5">
                  <div className={`
                    flex flex-wrap items-start justify-between gap-2
                  `}>
                    <div>
                      <p className="font-semibold">{i18n("Venues in this chain")}</p>
                      <p className="mt-1 text-sm text-neutral">
                        {i18n("Search and select venues to group them. A venue can belong to one chain at a time.")}
                      </p>
                    </div>
                    <span className="text-sm text-neutral">
                      {i18n("{count} selected", { count: selectedVenueIds.size })}
                    </span>
                  </div>

                  {selectedVenues.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedVenues.map((venue) => (
                        <span
                          className={`
                            inline-flex max-w-full items-center gap-1
                            rounded-full bg-primary/10 py-1 pr-1 pl-3 text-sm
                            text-on-surface
                          `}
                          key={venue.id}
                        >
                          <span className="truncate">{venue.name}</span>
                          <ActionButton
                            aria-label={i18n("Remove {venue} from this chain", { venue: venue.name })}
                            icon={<X aria-hidden size={14} />}
                            onClick={() => toggleVenue(venue.id)}
                            size="sm"
                            variant="ghost"
                          />
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 max-w-2xl">
                    <Input
                      label={i18n("Add venues")}
                      onChange={(event) => setVenueQuery(event.target.value)}
                      placeholder={i18n("Search by venue or city")}
                      type="search"
                      value={venueQuery}
                    />
                    {venueQuery.trim().length > 0 && venueQuery.trim().length < 2 && (
                      <p className="mt-2 text-sm text-neutral">
                        {i18n("Type at least two characters to search venues.")}
                      </p>
                    )}
                  </div>

                  {(isSearchingVenues || venueQuery.trim().length >= 2) && (
                    <div className={`
                      mt-3 divide-y rounded-lg border border-on-surface/10
                    `}>
                      {isSearchingVenues ? (
                        <p className="px-3 py-4 text-sm text-neutral">{i18n("Searching venues…")}</p>
                      ) : venueResults.length === 0 ? (
                        <p className="px-3 py-4 text-sm text-neutral">{i18n("No venues found.")}</p>
                      ) : (
                        venueResults.map((venue) => {
                          const currentChain = venue.chain_id ? chainsById.get(venue.chain_id) : null;
                          return (
                            <div className={`
                              flex items-center justify-between gap-3 px-3 py-3
                            `} key={venue.id}>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{venue.name}</p>
                                <p className="truncate text-sm text-neutral">
                                  {formatChainLocation(venue) || i18n("No location set")}
                                  {currentChain && ` · ${i18n("Currently in {chain}", { chain: currentChain.name })}`}
                                </p>
                              </div>
                              <Checkbox
                                aria-label={i18n("Assign {venue} to this chain", { venue: venue.name })}
                                checked={selectedVenueIds.has(venue.id)}
                                onChange={() => toggleVenue(venue.id)}
                                size="sm"
                              />
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>);
}

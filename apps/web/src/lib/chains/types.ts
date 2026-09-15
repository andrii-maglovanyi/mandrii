export type ChainDetails = Omit<ChainSummary, "child_chain_count" | "display_category" | "venue_count">;

export type ChainSummary = {
  chain_id: null | string;
  child_chain_count: number;
  city: null | string;
  country: null | string;
  display_category: null | string;
  id: string;
  name: string;
  slug: string;
  venue_count: number;
};
export type ChainVenue = { category: string; chain_id: null | string; city: null | string; country: null | string; id: string; name: string; slug: string };

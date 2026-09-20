import { revalidateTag } from "next/cache";

import { clearPublicFlights } from "./single-flight";

export const PUBLIC_CONTENT_TAG = "public-content-v1";
export const COMMUNITY_TAG = "public-community-v1";

export function invalidateCommunity() {
  clearPublicFlights("community");
  revalidateTag(COMMUNITY_TAG, { expire: 0 });
}

/** Dependencies cross entity boundaries: venues embed events and chain members. */
export function invalidatePublicContent() {
  clearPublicFlights();
  revalidateTag(PUBLIC_CONTENT_TAG, { expire: 0 });
  revalidateTag(COMMUNITY_TAG, { expire: 0 });
}

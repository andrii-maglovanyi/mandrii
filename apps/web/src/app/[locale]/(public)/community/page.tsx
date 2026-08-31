import { MixpanelTracker } from "~/components/layout";
import { CommunityRequestsBoard } from "~/features/CommunityRequests";
import { auth } from "~/lib/auth";
import { COMMUNITY_REQUEST_CATEGORIES, COMMUNITY_REQUEST_KINDS } from "~/lib/community-requests/types";
import { getCommunityRequestPage } from "~/lib/models/community-requests";

export const dynamic = "force-dynamic";

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; country?: string; kind?: string; location?: string; q?: string }>;
}) {
  const { category, country, kind, location, q } = await searchParams;
  const normalizedCountry = country?.trim() || undefined;
  const normalizedLocation = location?.trim() || undefined;
  const normalizedQuery = q?.trim().slice(0, 120) || undefined;
  const normalizedKind = COMMUNITY_REQUEST_KINDS.includes(kind as (typeof COMMUNITY_REQUEST_KINDS)[number])
    ? (kind as (typeof COMMUNITY_REQUEST_KINDS)[number])
    : undefined;
  const normalizedCategory = COMMUNITY_REQUEST_CATEGORIES.includes(
    category as (typeof COMMUNITY_REQUEST_CATEGORIES)[number],
  )
    ? (category as (typeof COMMUNITY_REQUEST_CATEGORIES)[number])
    : undefined;
  const session = await auth();
  const page = await getCommunityRequestPage(
    {
      category: normalizedCategory,
      country: normalizedCountry,
      kind: normalizedKind,
      location: normalizedLocation,
      query: normalizedQuery,
      viewerUserId: session?.user?.id,
    },
    null,
  );
  return (
    <>
      <CommunityRequestsBoard
        initialFilters={{
          category: normalizedCategory,
          country: normalizedCountry,
          kind: normalizedKind,
          location: normalizedLocation,
          query: normalizedQuery,
        }}
        initialPage={page}
        initialViewerUserId={session?.user?.id}
      />
      <MixpanelTracker event="Viewed Community Requests Page" />
    </>
  );
}

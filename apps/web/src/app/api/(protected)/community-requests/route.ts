import { z } from "zod";

import { auth } from "~/lib/auth";
import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { hasCommunityRequestContactDetails } from "~/lib/community-requests/safety";
import {
  COMMUNITY_REQUEST_CATEGORIES,
  COMMUNITY_REQUEST_KINDS,
  CommunityRequestCursor,
} from "~/lib/community-requests/types";
import { communityRequestInputSchema } from "~/lib/community-requests/validation";
import { createCommunityRequest, getCommunityRequestPage, getCommunityRequests } from "~/lib/models/community-requests";

const relatedContentQuerySchema = z
  .object({
    eventId: z.string().uuid().optional(),
    venueId: z.string().uuid().optional(),
  })
  .refine(({ eventId, venueId }) => Boolean(eventId) !== Boolean(venueId), { message: "Choose one content target" });

const listQuerySchema = z.object({
  category: z.enum(COMMUNITY_REQUEST_CATEGORIES).optional(),
  country: z.string().trim().min(2).max(100).optional(),
  kind: z.enum(COMMUNITY_REQUEST_KINDS).optional(),
  limit: z.coerce.number().int().min(1).max(30).default(12),
  location: z.string().trim().min(2).max(200).optional(),
  q: z.string().trim().min(1).max(120).optional(),
});

const parseCursor = (value: string | null): CommunityRequestCursor | null => {
  if (!value) return null;
  const [locationRank, createdAt, id] = value.split("|");
  if (
    (locationRank !== "0" && locationRank !== "1") ||
    !createdAt ||
    !id ||
    value.split("|").length !== 3 ||
    !z.string().datetime({ offset: true }).safeParse(createdAt).success ||
    !z.string().uuid().safeParse(id).success
  ) {
    throw new BadRequestError("A valid community cursor is required");
  }
  return { createdAt, id, locationRank: Number(locationRank) as 0 | 1 };
};

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    await rateLimiters.general.check();
    const url = new URL(req.url);
    const eventId = url.searchParams.get("eventId") ?? undefined;
    const venueId = url.searchParams.get("venueId") ?? undefined;
    if (eventId || venueId) {
      const target = relatedContentQuerySchema.parse({ eventId, venueId });
      return Response.json(
        await getCommunityRequests({ relatedEventId: target.eventId, relatedVenueId: target.venueId }, 6),
      );
    }
    const query = listQuerySchema.parse({
      category: url.searchParams.get("category") ?? undefined,
      eventId: url.searchParams.get("eventId") ?? undefined,
      country: url.searchParams.get("country") ?? undefined,
      kind: url.searchParams.get("kind") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      location: url.searchParams.get("location") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      venueId: url.searchParams.get("venueId") ?? undefined,
    });
    const session = await auth();
    return Response.json(
      await getCommunityRequestPage(
        {
          category: query.category,
          country: query.country,
          kind: query.kind,
          location: query.location,
          query: query.q,
          viewerUserId: session?.user?.id,
        },
        parseCursor(url.searchParams.get("cursor")),
        query.limit,
      ),
    );
  });

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.contentUpdate.check(session.user.id);
    const data = await validateRequest(req, communityRequestInputSchema);
    if (hasCommunityRequestContactDetails(`${data.title}\n${data.body}`)) {
      throw new BadRequestError("Please do not post phone numbers, email addresses or links here");
    }

    const request = await createCommunityRequest({
      ...data,
      expiresAt: new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000),
      userId: session.user.id,
    });
    return Response.json(request, { status: 201 });
  });

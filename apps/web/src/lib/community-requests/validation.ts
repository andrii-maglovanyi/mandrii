import { z } from "zod";

import { COMMUNITY_REQUEST_CATEGORIES, COMMUNITY_REQUEST_KINDS } from "./types";

export const communityRequestInputSchema = z
  .object({
    body: z.string().trim().min(5).max(1500),
    category: z.enum(COMMUNITY_REQUEST_CATEGORIES),
    country: z.string().trim().min(2).max(100),
    expiresInDays: z.number().int().min(1).max(365).default(14),
    kind: z.enum(COMMUNITY_REQUEST_KINDS),
    location: z.string().trim().min(2).max(200).nullable(),
    relatedEventId: z.string().uuid().nullable().default(null),
    relatedVenueId: z.string().uuid().nullable().default(null),
    title: z.string().trim().min(5).max(120),
  })
  .refine(({ relatedEventId, relatedVenueId }) => !(relatedEventId && relatedVenueId), {
    message: "Choose one related venue or event",
    path: ["relatedVenueId"],
  });

export type CommunityRequestInput = z.infer<typeof communityRequestInputSchema>;

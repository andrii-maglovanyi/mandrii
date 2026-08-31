import { z } from "zod";

import { rateLimiters, withErrorHandling } from "~/lib/api";
import { searchCommunityRelatedContent } from "~/lib/models/community-requests";

const querySchema = z.object({ q: z.string().trim().min(2).max(120) });

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    await rateLimiters.general.check();
    const { q } = querySchema.parse({ q: new URL(req.url).searchParams.get("q") ?? "" });
    return Response.json(await searchCommunityRelatedContent(q));
  });

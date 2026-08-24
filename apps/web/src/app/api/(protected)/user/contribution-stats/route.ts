import { getApiContext, withErrorHandling } from "~/lib/api";
import { getCommunityContributionCounts } from "~/lib/gamification/contributions";

export const dynamic = "force-dynamic";

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });

    return Response.json(await getCommunityContributionCounts(session.user.id));
  });

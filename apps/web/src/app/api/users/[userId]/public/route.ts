import { z } from "zod";

import { BadRequestError, getApiContext, NotFoundError, withErrorHandling } from "~/lib/api";
import { getPublicUserImageUrl, UserModel } from "~/lib/models/user";

export const dynamic = "force-dynamic";

export const GET = (req: Request, { params }: { params: Promise<{ userId: string }> }) =>
  withErrorHandling(async () => {
    await getApiContext(req, { withAuth: true });
    const { userId } = await params;
    if (!z.uuid().safeParse(userId).success) throw new BadRequestError("A valid user ID is required");

    const profile = await new UserModel().findPublicById(userId);
    if (!profile) throw new NotFoundError("User not found");

    return Response.json({
      profile: {
        ...profile,
        image: getPublicUserImageUrl(profile.image),
        name: profile.name || "Someone",
      },
    });
  });

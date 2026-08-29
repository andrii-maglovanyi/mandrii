import { z } from "zod";

import { BadRequestError, getApiContext, NotFoundError, withErrorHandling } from "~/lib/api";
import { getPublicUserImageUrl, UserModel } from "~/lib/models/user";

export const dynamic = "force-dynamic";

export const GET = (req: Request, { params }: { params: Promise<{ userId: string }> }) =>
  withErrorHandling(async () => {
    await getApiContext(req, { withAuth: true });
    const { userId } = await params;
    const isId = z.uuid().safeParse(userId).success;
    const isUsername = /^[a-z0-9_]{3,30}$/i.test(userId);
    if (!isId && !isUsername) throw new BadRequestError("A valid user ID or username is required");

    const profile = isId
      ? await new UserModel().findPublicById(userId)
      : await new UserModel().findPublicByUsername(userId);
    if (!profile) throw new NotFoundError("User not found");

    return Response.json({
      profile: {
        ...profile,
        image: getPublicUserImageUrl(profile.image),
        name: profile.name || "Someone",
      },
    });
  });

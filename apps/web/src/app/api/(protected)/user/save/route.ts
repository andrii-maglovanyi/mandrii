import { NextResponse } from "next/server";

import { getApiContext } from "~/lib/api/context";
import { InternalServerError } from "~/lib/api/errors";
import { validateRequest } from "~/lib/api/validate";
import { withErrorHandling } from "~/lib/api/withErrorHandling";
import { envName } from "~/lib/config/env";
import { saveUser } from "~/lib/models/user";
import { processImages } from "~/lib/utils/images";
import { getUserSchema } from "~/lib/validation/user";
import { Users } from "~/types";

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { i18n, session } = await getApiContext(req, { withAuth: true, withI18n: true });

    const schema = getUserSchema(i18n);

    const { image, name, ...data } = await validateRequest(req, schema);

    const profileData: Partial<Users> = {
      ...data,
      name: name.trim(),
    };

    const prefix = [envName, "users", profileData.id].join("/");
    profileData.image = (await processImages(image ? [image] : [], [prefix, "image"].join("/")))[0] ?? "";

    const id = await saveUser(profileData, session);

    if (!id) {
      throw new InternalServerError("Failed to save user");
    }

    return NextResponse.json({ id, success: true }, { status: 200 });
  });

import { NextResponse } from "next/server";

import { getApiContext, InternalServerError, ValidationError, validateRequest, withErrorHandling } from "~/lib/api";
import { envName } from "~/lib/config/env";
import { UserModel, type UserUpdate } from "~/lib/models";
import { processImages } from "~/lib/utils/images";
import { getUserSchema } from "~/lib/validation/user";

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { i18n, session } = await getApiContext(req, { withAuth: true, withI18n: true });

    const schema = getUserSchema(i18n);

    const { image, name, ...data } = await validateRequest(req, schema);

    const profileData: UserUpdate = {
      ...data,
      name: name.trim(),
    };

    if (profileData.username) {
      const existingUser = await new UserModel().findPublicByUsername(profileData.username);
      if (existingUser && existingUser.id !== session.user.id) {
        throw new ValidationError("Validation failed", [
          { code: "custom", message: "This username is already taken", path: ["username"] },
        ]);
      }
    }

    const prefix = [envName, "users", profileData.id].join("/");
    profileData.image = (await processImages(image ? [image] : [], [prefix, "image"].join("/")))[0] ?? "";

    const userModel = new UserModel(session);
    const { id } = await userModel.update(profileData);

    if (!id) {
      throw new InternalServerError("Failed to save user");
    }

    return NextResponse.json({ id, success: true }, { status: 200 });
  });

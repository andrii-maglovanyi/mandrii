import { z } from "zod";

import { IMAGE_UPLOAD_PROFILES, isProcessedImageUpload } from "~/lib/images/uploadConfig";
import { Scalars } from "~/types";

const optionalText = (max: number, message: string) =>
  z.preprocess((value) => (value === "" ? null : value), z.string().trim().max(max, { message }).optional().nullable());

export const getUserSchema = (i18n: (key: string) => string) =>
  z.object({
    bio: optionalText(500, i18n("Bio must be 500 characters or fewer")),
    city: optionalText(120, i18n("City must be 120 characters or fewer")),
    id: z.uuid({ message: i18n("Invalid user ID") }).transform((v) => v as Scalars["uuid"]["output"]),
    image: z.preprocess(
      (val) => (val === "" ? null : val),
      z
        .instanceof(File)
        .refine(
          (image) => isProcessedImageUpload(image, IMAGE_UPLOAD_PROFILES.profile.maxBytes),
          i18n("Please choose a supported image."),
        )
        .optional()
        .nullable(),
    ),
    name: z.string().min(1, { message: i18n("Name is required") }),
  });

export type UserFormData = z.infer<UserSchema>;
export type UserSchema = ReturnType<typeof getUserSchema>;

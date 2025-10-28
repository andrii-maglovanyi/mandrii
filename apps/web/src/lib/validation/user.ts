import { z } from "zod";

import { Scalars } from "~/types";

export const getUserSchema = (i18n: (key: string) => string) =>
  z.object({
    id: z.uuid({ message: i18n("Invalid user ID") }).transform((v) => v as Scalars["uuid"]["output"]),
    image: z.preprocess((val) => (val === "" ? null : val), z.instanceof(File).optional().nullable()),
    name: z.string().min(1, { message: i18n("Name is required") }),
  });

export type UserFormData = z.infer<UserSchema>;
export type UserSchema = ReturnType<typeof getUserSchema>;

import { z } from "zod";
import { Scalars } from "~/types";

export const getUserSchema = (i18n: (key: string) => string) =>
  z.object({
    id: z.uuid({ message: i18n("Invalid user ID") }).transform((v) => v as Scalars["uuid"]["output"]),
    name: z.string().min(1, { message: i18n("Name is required") }),
  });

export type UserSchema = ReturnType<typeof getUserSchema>;
export type UserFormData = z.infer<UserSchema>;

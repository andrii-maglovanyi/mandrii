import { z } from "zod";

import { isEmail } from "../utils";

export const getEmailSchema = (i18n: (key: string) => string) =>
  z.object({
    captchaToken: z.string().min(1),
    email: z.string().refine(
      (email) => {
        const trimmed = email.trim();
        return trimmed === "" || isEmail(trimmed);
      },
      {
        message: i18n("Invalid email address"),
      },
    ),
  });

export const getEmailFormSchema = (i18n: (key: string) => string) => getEmailSchema(i18n).omit({ captchaToken: true });

import { z } from "zod";

export const getEmailSchema = (i18n: (key: string) => string) =>
  z.object({
    captchaToken: z.string().min(1),
    email: z.string().email(i18n("Please enter a valid email address")),
  });

export const getEmailFormSchema = (i18n: (key: string) => string) =>
  getEmailSchema(i18n).omit({ captchaToken: true });

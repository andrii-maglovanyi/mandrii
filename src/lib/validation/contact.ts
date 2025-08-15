import { z } from "zod";

export const getContactSchema = (i18n: (key: string) => string) =>
  z.object({
    captchaToken: z.string().min(1),
    email: z.string().email(i18n("Please enter a valid email address")),
    message: z.string().min(1, i18n("Message is required")).max(1000, i18n("Message is too long")),
    name: z.string().min(2, i18n("Name is required")),
  });

export const getContactFormSchema = (i18n: (key: string) => string) =>
  getContactSchema(i18n).omit({ captchaToken: true });

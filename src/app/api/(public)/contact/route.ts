import { Resend } from "resend";

import { getLocaleContext } from "~/lib/api/helpers";
import { verifyCaptcha } from "~/lib/api/recaptcha";
import { validateRequest } from "~/lib/api/validate";
import { withErrorHandling } from "~/lib/api/withErrorHandling";
import { constants } from "~/lib/constants";
import { getContactSchema } from "~/lib/validation/contact";

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { error, i18n, locale } = await getLocaleContext(req);
    if (error) return error;

    const schema = getContactSchema(i18n);

    const validation = await validateRequest(req, schema);
    if ("error" in validation) return validation.error;

    const { captchaToken, email, message, name } = validation.data;

    const captchaError = await verifyCaptcha(captchaToken, "contact_form");
    if (captchaError) return captchaError;

    await resend.emails.send({
      from: constants.fromEmail(locale),
      subject: i18n("A message from {name}<{email}>", { email, name }),
      text: message,
      to: process.env.AUTHOR_EMAIL!,
    });

    return Response.json({ status: "sent" });
  });

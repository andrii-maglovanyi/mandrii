import { Resend } from "resend";

import { getApiContext } from "~/lib/api/context";
import { BadGateway } from "~/lib/api/errors";
import { verifyCaptcha } from "~/lib/api/recaptcha";
import { validateRequest } from "~/lib/api/validate";
import { withErrorHandling } from "~/lib/api/withErrorHandling";
import { privateConfig } from "~/lib/config/private";
import { constants } from "~/lib/constants";
import { getContactSchema } from "~/lib/validation/contact";

const resend = new Resend(privateConfig.email.resendApiKey);

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { i18n, locale } = await getApiContext(req, { withI18n: true });
    const schema = getContactSchema(i18n);
    const { captchaToken, email, message, name } = await validateRequest(req, schema);

    await verifyCaptcha(captchaToken, "contact_form");

    const result = await resend.emails.send({
      from: constants.fromEmail(locale),
      subject: i18n("A message from {name}<{email}>", { email, name }),
      text: message,
      to: privateConfig.email.authorEmail,
    });

    if (result.error) {
      throw new BadGateway(result.error.message);
    }

    return Response.json({ status: "sent" });
  });

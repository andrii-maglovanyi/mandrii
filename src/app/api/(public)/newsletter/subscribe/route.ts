import { CreateContactResponse, GetContactResponse, Resend } from "resend";

import VerifyEmail from "~/components/email/VerifyEmail";
import { getLocaleContext } from "~/lib/api/helpers";
import { verifyCaptcha } from "~/lib/api/recaptcha";
import { validateRequest } from "~/lib/api/validate";
import { withErrorHandling } from "~/lib/api/withErrorHandling";
import { constants } from "~/lib/constants";
import { getEmailSchema } from "~/lib/validation/email";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");
const { audienceId, baseUrl, fromEmail } = constants;

const sendVerificationEmail = async (
  contact: CreateContactResponse | GetContactResponse,
  locale: string,
  email: string,
  i18n: (value: string) => string,
) => {
  const verifyUrl = `${baseUrl}/api/newsletter/verify?key=${contact.data?.id}&locale=${locale}`;

  await resend.emails.send({
    from: fromEmail(locale),
    react: VerifyEmail({ i18n, url: verifyUrl }),
    subject: i18n("Confirm your subscription"),
    to: email,
  });
};

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { error, i18n, locale } = await getLocaleContext(req);
    if (error) return error;

    const schema = getEmailSchema(i18n);

    const validation = await validateRequest(req, schema);
    if ("error" in validation) return validation.error;

    const { captchaToken, email } = validation.data;

    const captchaError = await verifyCaptcha(captchaToken, "newsletter_form");
    if (captchaError) return captchaError;

    const contact = await resend.contacts.get({ audienceId, email });

    if (contact?.data) {
      if (contact.data.unsubscribed) {
        await sendVerificationEmail(contact, locale, email, i18n);
        return Response.json({ status: "verification_email_sent" });
      }
      return Response.json({ status: "already_subscribed" });
    }

    const newContact = await resend.contacts.create({
      audienceId,
      email,
      unsubscribed: true,
    });

    await sendVerificationEmail(newContact, locale, email, i18n);
    return Response.json({ status: "verification_email_sent" });
  });

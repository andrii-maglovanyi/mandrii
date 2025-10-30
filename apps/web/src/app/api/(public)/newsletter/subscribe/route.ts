import { CreateContactResponse, GetContactResponse, Resend } from "resend";

import VerifyEmail from "~/components/email/VerifyEmail";
import { getApiContext } from "~/lib/api/context";
import { BadGateway } from "~/lib/api/errors";
import { verifyCaptcha } from "~/lib/api/recaptcha";
import { validateRequest } from "~/lib/api/validate";
import { withErrorHandling } from "~/lib/api/withErrorHandling";
import { privateConfig } from "~/lib/config/private";
import { constants } from "~/lib/constants";
import { sendNewsletterSubscriptionNotification } from "~/lib/slack/newsletter";
import { getEmailSchema } from "~/lib/validation/email";

const resend = new Resend(privateConfig.email.resendApiKey);
const { audienceId, baseUrl, fromEmail } = constants;

type Contact = CreateContactResponse | GetContactResponse;

interface VerificationEmailParams {
  contact: Contact;
  email: string;
  i18n: (value: string) => string;
  locale: string;
}

const sendVerificationEmail = async ({ contact, email, i18n, locale }: VerificationEmailParams): Promise<void> => {
  const contactId = contact.data?.id;

  if (!contactId) {
    throw new BadGateway("Failed to create contact");
  }

  const verifyUrl = `${baseUrl}/api/newsletter/verify?key=${contactId}&locale=${locale}`;

  const result = await resend.emails.send({
    from: fromEmail(locale),
    react: VerifyEmail({ i18n, url: verifyUrl }),
    subject: i18n("Confirm your subscription"),
    to: email,
  });

  if (result.error) {
    throw new BadGateway(`Failed to send verification email: ${result.error.message}`);
  }
};

export const POST = (req: Request): Promise<Response> =>
  withErrorHandling(async () => {
    const { i18n, locale } = await getApiContext(req, { withI18n: true });
    const schema = getEmailSchema(i18n);
    const { captchaToken, email } = await validateRequest(req, schema);

    await verifyCaptcha(captchaToken, "newsletter_form");

    const existingContact = await resend.contacts.get({ audienceId, email });

    if (existingContact.error) {
      if (!existingContact.error.message.includes("not found")) {
        throw new BadGateway(`Failed to check contact: ${existingContact.error.message}`);
      }
    }

    if (existingContact.data) {
      if (existingContact.data.unsubscribed) {
        await sendVerificationEmail({
          contact: existingContact,
          email,
          i18n,
          locale,
        });
        return Response.json({ status: "verification_email_sent" });
      }

      return Response.json({ status: "already_subscribed" });
    }

    const newContact = await resend.contacts.create({
      audienceId,
      email,
      unsubscribed: true,
    });

    if (newContact.error) {
      throw new BadGateway(`Failed to create contact: ${newContact.error.message}`);
    }

    await sendVerificationEmail({
      contact: newContact,
      email,
      i18n,
      locale,
    });

    sendNewsletterSubscriptionNotification(email);

    return Response.json({ status: "verification_email_sent" });
  });

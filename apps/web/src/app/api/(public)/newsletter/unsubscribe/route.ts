import { GetContactResponse, Resend } from "resend";

import { getLocaleContext } from "~/lib/api/helpers";
import { withErrorHandling } from "~/lib/api/withErrorHandling";
import { privateConfig } from "~/lib/config/private";
import { constants } from "~/lib/constants";

const resend = new Resend(privateConfig.email.resendApiKey);
const { audienceId, baseUrl } = constants;

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { error, locale } = await getLocaleContext(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("key");

    if (!id) {
      return new Response("Invalid unsubscribe link", { status: 400 });
    }

    const contact: GetContactResponse = await resend.contacts.get({
      audienceId,
      id,
    });

    if (!contact?.data) {
      return new Response("No contact found", { status: 404 });
    }

    if (contact.data.unsubscribed) {
      return new Response("Already unsubscribed", { status: 200 });
    }

    await resend.contacts.update({
      audienceId,
      id,
      unsubscribed: true,
    });

    return Response.redirect(`${baseUrl}/${locale}/newsletter/unsubscribed`, 302);
  });

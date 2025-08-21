import { Resend } from "resend";

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

    const url = new URL(req.url);

    const id = url.searchParams.get("key");

    if (!id) {
      return new Response("Missing or invalid verification link.", {
        status: 400,
      });
    }

    const contact = await resend.contacts.get({ audienceId, id });

    if (!contact?.data) {
      return new Response("Invalid token or contact not found.", {
        status: 400,
      });
    }

    await resend.contacts.update({
      audienceId,
      id,
      unsubscribed: false,
    });

    return Response.redirect(`${baseUrl}/${locale}/newsletter/subscribed`, 302);
  });

import { Resend } from "resend";

import { getApiContext } from "~/lib/api/context";
import { BadGateway, BadRequestError, NotFoundError } from "~/lib/api/errors";
import { withErrorHandling } from "~/lib/api/withErrorHandling";
import { privateConfig } from "~/lib/config/private";
import { constants } from "~/lib/constants";

const resend = new Resend(privateConfig.email.resendApiKey);
const { audienceId, baseUrl } = constants;

export const GET = (req: Request): Promise<Response> =>
  withErrorHandling(async () => {
    const { locale } = await getApiContext(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("key");

    if (!id) {
      throw new BadRequestError("Invalid unsubscribe link - missing key");
    }

    const contact = await resend.contacts.get({
      audienceId,
      id,
    });

    if (contact.error) {
      throw new BadGateway(`Failed to get contact: ${contact.error.message}`);
    }

    if (!contact.data) {
      throw new NotFoundError("Contact not found");
    }

    if (contact.data.unsubscribed) {
      return Response.redirect(`${baseUrl}/${locale}/newsletter/unsubscribed`, 302);
    }

    const updateResult = await resend.contacts.update({
      audienceId,
      id,
      unsubscribed: true,
    });

    if (updateResult.error) {
      throw new BadGateway(`Failed to unsubscribe: ${updateResult.error.message}`);
    }

    return Response.redirect(`${baseUrl}/${locale}/newsletter/unsubscribed`, 302);
  });

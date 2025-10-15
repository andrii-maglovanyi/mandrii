import { getApiContext } from "~/lib/api/context";
import { BadRequestError } from "~/lib/api/errors";
import { validateRequest } from "~/lib/api/validate";
import { withErrorHandling } from "~/lib/api/withErrorHandling";
import { privateConfig } from "~/lib/config/private";
import { getAddressSchema } from "~/lib/validation/address";

import { geocodeAddress } from "./geo";

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { i18n } = await getApiContext(req, { withAuth: true, withI18n: true });
    const schema = getAddressSchema(i18n);
    const { address } = await validateRequest(req, schema);

    const geo = await geocodeAddress(address.trim(), privateConfig.maps.apiKey);

    if (!geo) {
      throw new BadRequestError("Invalid address");
    }

    return Response.json(geo);
  });

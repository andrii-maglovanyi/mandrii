import { z } from "zod";

import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { privateConfig } from "~/lib/config/private";
import { getAddressSchema } from "~/lib/validation/address";

import { geocodeAddress, reverseGeocodeCoordinates } from "./geo";

const reverseGeocodeSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { i18n, session } = await getApiContext(req, { withAuth: true, withI18n: true });
    await rateLimiters.general.check(session.user.id);
    const input = await validateRequest(req, z.union([getAddressSchema(i18n), reverseGeocodeSchema]));
    const geo =
      "address" in input
        ? await geocodeAddress(input.address.trim(), privateConfig.maps.apiKey)
        : await reverseGeocodeCoordinates(input.latitude, input.longitude, privateConfig.maps.apiKey);

    if (!geo) {
      throw new BadRequestError("Invalid address");
    }

    return Response.json(geo);
  });

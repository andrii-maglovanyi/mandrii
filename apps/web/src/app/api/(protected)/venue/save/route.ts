import { NextResponse } from "next/server";

import {
  BadRequestError,
  getApiContext,
  InternalServerError,
  validateRequest,
  ValidationError,
  withErrorHandling,
} from "~/lib/api";
import { envName } from "~/lib/config/env";
import { privateConfig } from "~/lib/config/private";
import { saveUser } from "~/lib/models/user";
import { saveVenue } from "~/lib/models/venue";
import { sendSlackNotification } from "~/lib/slack/venue";
import { processImages } from "~/lib/utils/images";
import { getVenueSchema } from "~/lib/validation/venue";
import { Venues } from "~/types";
import { UUID } from "~/types/uuid";

import { geocodeAddress } from "../../geocode/geo";
import { checkCoordinatesWithinRange, checkIsSlugUnique } from "./validation";

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { i18n, session } = await getApiContext(req, { withAuth: true, withI18n: true });

    const schema = getVenueSchema(i18n);
    const data = await validateRequest(req, schema);

    const {
      address,
      area,
      category,
      description_en,
      description_uk,
      emails,
      images,
      is_owner,
      is_physical,
      latitude,
      logo,
      longitude,
      name,
      phone_numbers,
      slug,
    } = data;

    const venueData: Partial<Venues> = {
      category,
      description_en,
      description_uk,
      emails: emails?.map((email) => email.trim()) || [],
      images: [],
      name: name.trim(),
      phone_numbers: phone_numbers?.map((phone) => phone.trim()) || [],
      social_links: { facebook: data.facebook?.trim() || null, instagram: data.instagram?.trim() || null },
      website: data.website?.trim() || null,
    };

    if (data.id) {
      venueData.id = data.id as UUID;
    } else {
      const isSlugUnique = await checkIsSlugUnique(slug);

      if (!isSlugUnique) {
        throw new ValidationError("Invalid input", [
          { code: "custom", message: i18n("Slug is already taken"), path: ["slug"] },
        ]);
      }

      venueData.slug = slug.trim();
    }

    if (address) {
      const geo = await geocodeAddress(address.trim(), privateConfig.maps.apiKey);

      if (!geo) {
        throw new BadRequestError("Invalid address");
      }

      const { city, coordinates, country, postcode } = geo;
      venueData.address = geo.address;
      venueData.area = area || geo.area;
      venueData.country = country;
      venueData.city = city;
      venueData.postcode = postcode;

      if (is_physical) {
        if (longitude && latitude && checkCoordinatesWithinRange(coordinates, [longitude, latitude])) {
          venueData.geo = {
            coordinates: [longitude, latitude],
            type: "Point",
          };
        } else {
          venueData.geo = {
            coordinates,
            type: "Point",
          };
        }
      } else {
        venueData.geo = null;
      }
    }

    const prefix = [envName, "venues", slug].join("/");

    venueData.logo = (await processImages(logo ? [logo] : [], [prefix, "logo"].join("/")))[0] ?? "";
    venueData.images = await processImages(images ?? [], [prefix, "images"].join("/"));
    const venueId = await saveVenue(venueData, session, Boolean(is_owner));

    if (!venueId) {
      throw new InternalServerError("Failed to save venue");
    }

    // Update user points and venues_created only for new venues
    if (!venueData.id) {
      const userId = await saveUser(
        {
          id: session.user.id,
          points: (session.user.points ?? 0) + privateConfig.rewards.pointsPerVenueCreation,
          venues_created: (session.user.venues_created ?? 0) + 1,
        },
        session,
      );

      if (!userId) {
        throw new InternalServerError("Failed to save user");
      }
    }

    sendSlackNotification(session.user, venueData);

    return NextResponse.json({ id: venueId, success: true }, { status: 200 });
  });

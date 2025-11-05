import { NextResponse } from "next/server";

import { getApiContext, InternalServerError, validateRequest, ValidationError, withErrorHandling } from "~/lib/api";
import { envName } from "~/lib/config/env";
import { privateConfig } from "~/lib/config/private";
import { saveEvent } from "~/lib/models/event";
import { saveUser } from "~/lib/models/user";
import { sendSlackNotification } from "~/lib/slack/event";
import { processImages } from "~/lib/utils/images";
import { getEventSchema } from "~/lib/validation/event";
import { Events, Price_Type_Enum } from "~/types";
import { Timestamp } from "~/types/timestamp";
import { UUID } from "~/types/uuid";

import { checkIsSlugUnique } from "./validation";

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { i18n, session } = await getApiContext(req, { withAuth: true, withI18n: true });

    const schema = getEventSchema(i18n);
    const data = await validateRequest(req, schema);

    const {
      accessibility_info,
      age_restriction,
      area,
      capacity,
      city,
      country,
      custom_location_address,
      custom_location_name,
      description_en,
      description_uk,
      end_date,
      external_url,
      images,
      is_online,
      is_recurring,
      language,
      latitude,
      longitude,
      organizer_email,
      organizer_name,
      organizer_phone_number,
      price_amount,
      price_currency,
      price_type,
      recurrence_rule,
      registration_required,
      registration_url,
      slug,
      start_date,
      title,
      type,
      venue_id,
    } = data;

    const eventData: Partial<Events> = {
      accessibility_info,
      age_restriction: age_restriction?.trim(),
      area: area?.trim(),
      capacity,
      city: city?.trim(),
      country: country?.trim(),
      custom_location_address: custom_location_address?.trim(),
      custom_location_name: custom_location_name?.trim(),
      description_en,
      description_uk,
      end_date: end_date as Timestamp,
      external_url: external_url?.trim() || null,
      images: [],
      is_online: Boolean(is_online),
      is_recurring: Boolean(is_recurring),
      language,
      organizer_email,
      organizer_name: organizer_name?.trim(),
      organizer_phone_number,
      owner_id: session.user.id as UUID,
      price_amount,
      price_currency,
      price_type,
      recurrence_rule: recurrence_rule?.trim() || null,
      registration_required: Boolean(registration_required),
      registration_url: registration_url?.trim() || null,
      social_links: {
        facebook: data.facebook?.trim() || null,
        instagram: data.instagram?.trim() || null,
      },
      start_date: start_date as Timestamp,
      title: title.trim(),
      type,
      venue_id: venue_id as UUID,
    };

    if (data.id) {
      eventData.id = data.id as UUID;
    } else {
      const isSlugUnique = await checkIsSlugUnique(slug);

      if (!isSlugUnique) {
        throw new ValidationError("Invalid input", [
          { code: "custom", message: i18n("Slug is already taken"), path: ["slug"] },
        ]);
      }

      eventData.slug = slug.trim();
    }

    if (latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined) {
      eventData.geo = {
        coordinates: [longitude, latitude],
        type: "Point",
      };
    } else {
      eventData.geo = null;
    }

    if (price_type === Price_Type_Enum.Paid || price_type === Price_Type_Enum.SuggestedDonation) {
      if (!price_amount || price_amount <= 0) {
        throw new ValidationError("Invalid input", [
          { code: "custom", message: i18n("Price amount is required for paid events"), path: ["price_amount"] },
        ]);
      }
    }

    const prefix = [envName, "events", slug].join("/");
    eventData.images = await processImages(images ?? [], [prefix, "images"].join("/"));

    const eventId = await saveEvent(eventData, session);

    if (!eventId) {
      throw new InternalServerError("Failed to save event");
    }

    // Update user points and events_created only for new events
    if (!eventData.id) {
      const userId = await saveUser(
        {
          events_created: (session.user.events_created ?? 0) + 1,
          id: session.user.id,
          points: (session.user.points ?? 0) + privateConfig.rewards.pointsPerEventCreation,
        },
        session,
      );

      if (!userId) {
        throw new InternalServerError("Failed to save user");
      }
    }

    sendSlackNotification(session.user, eventData);

    return NextResponse.json({ id: eventId, success: true }, { status: 200 });
  });

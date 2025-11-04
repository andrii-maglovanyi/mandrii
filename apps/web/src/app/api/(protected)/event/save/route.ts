import { NextResponse } from "next/server";

import { getApiContext } from "~/lib/api/context";
import { BadRequestError, InternalServerError, ValidationError } from "~/lib/api/errors";
import { validateRequest } from "~/lib/api/validate";
import { withErrorHandling } from "~/lib/api/withErrorHandling";
import { envName } from "~/lib/config/env";
import { privateConfig } from "~/lib/config/private";
import { saveUser } from "~/lib/models/user";
import { processImages } from "~/lib/utils/images";
import { Event_Status_Enum, getEventSchema, Price_Type_Enum } from "~/lib/validation/event";
import { UUID } from "~/types/uuid";

import { saveEvent } from "./saveEvent";
import { checkIsSlugUnique } from "./validation";

/**
 * POST /api/(protected)/event/save
 *
 * Creates or updates an event. Handles file uploads, location data,
 * and event tags.
 */
export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { i18n, session } = await getApiContext(req, { withAuth: true, withI18n: true });

    const schema = getEventSchema(i18n);
    const data = await validateRequest(req, schema);

    const {
      accessibility_info,
      age_restriction,
      capacity,
      city,
      country,
      custom_location_address,
      custom_location_name,
      description_en,
      description_uk,
      end_date,
      event_tags,
      event_type,
      external_url,
      image,
      images,
      is_online,
      is_recurring,
      language,
      latitude,
      longitude,
      organizer_contact,
      organizer_name,
      price_amount,
      price_currency,
      price_type,
      recurrence_rule,
      registration_required,
      registration_url,
      slug,
      start_date,
      title,
      venue_id,
    } = data;

    // Prepare event data
    const eventData: Partial<{
      id: UUID;
      title: string;
      slug: string;
      description_en: string | null;
      description_uk: string | null;
      start_date: Date | string;
      end_date: Date | string | null;
      event_type: string;
      venue_id: UUID | null;
      custom_location_name: string | null;
      custom_location_address: string | null;
      geo: { type: "Point"; coordinates: [number, number] } | null;
      city: string | null;
      country: string | null;
      is_online: boolean;
      image: string;
      images: string[];
      organizer_name: string;
      organizer_contact: string | null;
      price_type: string;
      price_amount: number | null;
      price_currency: string;
      registration_url: string | null;
      registration_required: boolean;
      external_url: string | null;
      social_links: Record<string, string | null>;
      language: string[] | null;
      capacity: number | null;
      age_restriction: string | null;
      accessibility_info: string | null;
      is_recurring: boolean;
      recurrence_rule: string | null;
      status: string;
      owner_id: UUID;
    }> = {
      title: title.trim(),
      start_date: typeof start_date === "string" ? start_date : start_date.toISOString(),
      end_date: end_date ? (typeof end_date === "string" ? end_date : end_date.toISOString()) : null,
      event_type,
      venue_id: (venue_id as UUID) || null,
      custom_location_name: custom_location_name?.trim() || null,
      custom_location_address: custom_location_address?.trim() || null,
      city: city?.trim() || null,
      country: country?.trim() || null,
      is_online: Boolean(is_online),
      description_en: description_en?.trim() || null,
      description_uk: description_uk?.trim() || null,
      organizer_name: organizer_name.trim(),
      organizer_contact: organizer_contact?.trim() || null,
      price_type,
      price_amount: price_amount || null,
      price_currency: price_currency || "EUR",
      registration_url: registration_url?.trim() || null,
      registration_required: Boolean(registration_required),
      external_url: external_url?.trim() || null,
      social_links: {
        facebook: data.facebook?.trim() || null,
        instagram: data.instagram?.trim() || null,
      },
      language: language || null,
      capacity: capacity || null,
      age_restriction: age_restriction?.trim() || null,
      accessibility_info: accessibility_info?.trim() || null,
      is_recurring: Boolean(is_recurring),
      recurrence_rule: recurrence_rule?.trim() || null,
      images: [],
      owner_id: session.user.id as UUID,
    };

    // Handle event ID (for updates)
    if (data.id) {
      eventData.id = data.id as UUID;
    } else {
      // Check slug uniqueness for new events
      const isSlugUnique = await checkIsSlugUnique(slug);

      if (!isSlugUnique) {
        throw new ValidationError("Invalid input", [
          { code: "custom", message: i18n("Slug is already taken"), path: ["slug"] },
        ]);
      }

      eventData.slug = slug.trim();
      // New events always start as PENDING for moderation
      eventData.status = Event_Status_Enum.PENDING;
    }

    // Handle geographic coordinates if provided
    if (latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined) {
      eventData.geo = {
        coordinates: [longitude, latitude],
        type: "Point",
      };
    } else {
      eventData.geo = null;
    }

    // Handle price validation
    if (price_type === Price_Type_Enum.PAID || price_type === Price_Type_Enum.SUGGESTED_DONATION) {
      if (!price_amount || price_amount <= 0) {
        throw new ValidationError("Invalid input", [
          { code: "custom", message: i18n("Price amount is required for paid events"), path: ["price_amount"] },
        ]);
      }
    }

    // Handle image uploads
    const prefix = [envName, "events", slug].join("/");
    eventData.image = (await processImages(image ? [image] : [], [prefix, "image"].join("/")))[0] ?? "";
    eventData.images = await processImages(images ?? [], [prefix, "images"].join("/"));

    // Save event to database
    const eventId = await saveEvent(eventData, event_tags || [], session);

    if (!eventId) {
      throw new InternalServerError("Failed to save event");
    }

    // Update user points and events_created only for new events
    if (!eventData.id) {
      const userId = await saveUser(
        {
          id: session.user.id,
          points: (session.user.points ?? 0) + privateConfig.rewards.pointsPerEventCreation,
          events_created: (session.user.events_created ?? 0) + 1,
        },
        session,
      );

      if (!userId) {
        throw new InternalServerError("Failed to save user");
      }
    }

    // TODO: Add Slack notification for new events (optional)
    // sendSlackNotification(session.user, eventData);

    return NextResponse.json({ id: eventId, success: true }, { status: 200 });
  });

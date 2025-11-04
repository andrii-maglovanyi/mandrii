import { z } from "zod";

import { getI18n } from "~/i18n/getI18n";
import { isEmail, isWebsite } from "~/lib/utils";

const MAX_IMAGES = 6;

export const eventDescriptionMaxCharsCount = 3000;

/**
 * Event Type Enum matching the database enum.
 */
export enum Event_Type_Enum {
  GATHERING = "GATHERING",
  CELEBRATION = "CELEBRATION",
  CONCERT = "CONCERT",
  WORKSHOP = "WORKSHOP",
  EXHIBITION = "EXHIBITION",
  FESTIVAL = "FESTIVAL",
  CONFERENCE = "CONFERENCE",
  THEATER = "THEATER",
  SCREENING = "SCREENING",
  SPORTS = "SPORTS",
  CHARITY = "CHARITY",
  OTHER = "OTHER",
}

/**
 * Price Type Enum matching the database enum.
 */
export enum Price_Type_Enum {
  FREE = "FREE",
  PAID = "PAID",
  DONATION = "DONATION",
  SUGGESTED_DONATION = "SUGGESTED_DONATION",
}

/**
 * Event Status Enum matching the database enum.
 */
export enum Event_Status_Enum {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  POSTPONED = "POSTPONED",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

/**
 * Get the Zod validation schema for event forms.
 *
 * @param i18n - Internationalization function for error messages.
 * @returns Zod schema for event validation.
 */
export const getEventSchema = (i18n: Awaited<ReturnType<typeof getI18n>>) => {
  return z
    .object({
      // Core Info
      title: z
        .string()
        .min(1, i18n("Title is required"))
        .max(200, i18n("Title must be less than 200 characters")),

      slug: z
        .string()
        .min(10, i18n("Slug must be at least 10 characters"))
        .max(150, i18n("Slug must be less than 150 characters"))
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, i18n("Slug must contain only lowercase letters, numbers, and hyphens")),

      description_en: z
        .string()
        .max(eventDescriptionMaxCharsCount, i18n("Description is too long"))
        .optional()
        .nullable(),

      description_uk: z
        .string()
        .max(eventDescriptionMaxCharsCount, i18n("Description is too long"))
        .optional()
        .nullable(),

      // Date/Time
      start_date: z
        .union([z.string(), z.date()])
        .refine(
          (val) => {
            try {
              const date = typeof val === "string" ? new Date(val) : val;
              return !Number.isNaN(date.getTime());
            } catch {
              return false;
            }
          },
          {
            message: i18n("Start date is required and must be a valid date"),
          },
        ),

      end_date: z
        .union([z.string(), z.date()])
        .refine(
          (val) => {
            if (!val) return true;
            try {
              const date = typeof val === "string" ? new Date(val) : val;
              return !Number.isNaN(date.getTime());
            } catch {
              return false;
            }
          },
          {
            message: i18n("End date must be a valid date"),
          },
        )
        .optional()
        .nullable(),

      // Event Type
      event_type: z.nativeEnum(Event_Type_Enum, {
        message: i18n("Please choose an event type"),
      }),

      // Location - Flexible (venue, custom, or online)
      venue_id: z.string().uuid(i18n("Invalid venue ID")).optional().nullable(),

      custom_location_name: z.string().max(200, i18n("Location name is too long")).optional().nullable(),

      custom_location_address: z.string().max(500, i18n("Address is too long")).optional().nullable(),

      city: z.string().max(100, i18n("City name is too long")).optional().nullable(),

      country: z.string().max(100, i18n("Country name is too long")).optional().nullable(),

      is_online: z.coerce.boolean().default(false),

      latitude: z
        .union([z.string().transform((val) => Number.parseFloat(val)), z.number()])
        .pipe(
          z
            .number()
            .min(-90, i18n("Latitude must be between -90 and 90"))
            .max(90, i18n("Latitude must be between -90 and 90")),
        )
        .optional()
        .nullable(),

      longitude: z
        .union([z.string().transform((val) => Number.parseFloat(val)), z.number()])
        .pipe(
          z
            .number()
            .min(-180, i18n("Longitude must be between -180 and 180"))
            .max(180, i18n("Longitude must be between -180 and 180")),
        )
        .optional()
        .nullable(),

      // Media
      image: z.preprocess((val) => (val === "" ? null : val), z.instanceof(File).optional().nullable()),

      images: z
        .array(z.instanceof(File))
        .max(MAX_IMAGES, i18n("Maximum is {MAX_IMAGES} images.", { MAX_IMAGES }))
        .optional()
        .nullable(),

      // Organizer
      organizer_name: z
        .string()
        .min(1, i18n("Organizer name is required"))
        .max(200, i18n("Organizer name is too long")),

      organizer_contact: z
        .string()
        .refine(
          (val) => {
            if (!val) return true;
            const trimmed = val.trim();
            // Allow email or phone
            return isEmail(trimmed) || /^\+?[\d\s()-]+$/.test(trimmed);
          },
          {
            message: i18n("Organizer contact must be a valid email or phone number"),
          },
        )
        .optional()
        .nullable(),

      // Pricing
      price_type: z.nativeEnum(Price_Type_Enum, {
        message: i18n("Please choose a price type"),
      }),

      price_amount: z
        .union([z.string().transform((val) => Number.parseFloat(val)), z.number()])
        .pipe(z.number().min(0, i18n("Price must be 0 or greater")))
        .optional()
        .nullable(),

      price_currency: z.string().length(3, i18n("Currency must be a 3-letter code (e.g., EUR, USD)")).default("EUR"),

      // Registration
      registration_url: z
        .string()
        .refine((val) => !val || isWebsite(val), {
          message: i18n("Registration URL is invalid"),
        })
        .optional()
        .nullable(),

      registration_required: z.coerce.boolean().default(false),

      external_url: z
        .string()
        .refine((val) => !val || isWebsite(val), {
          message: i18n("External URL is invalid"),
        })
        .optional()
        .nullable(),

      // Social & Metadata
      language: z.array(z.string()).optional().nullable(),

      capacity: z
        .union([z.string().transform((val) => Number.parseInt(val, 10)), z.number()])
        .pipe(z.number().int(i18n("Capacity must be a whole number")).min(1, i18n("Capacity must be at least 1")))
        .optional()
        .nullable(),

      age_restriction: z.string().max(50, i18n("Age restriction is too long")).optional().nullable(),

      accessibility_info: z.string().max(500, i18n("Accessibility info is too long")).optional().nullable(),

      // Recurring
      is_recurring: z.coerce.boolean().default(false),

      recurrence_rule: z.string().max(200, i18n("Recurrence rule is too long")).optional().nullable(),

      // Social Links (JSONB in database)
      facebook: z
        .string()
        .refine(
          (val) => {
            if (!val) return true;
            try {
              const url = new URL(val);
              const hostname = url.hostname.toLowerCase();
              return (
                hostname === "facebook.com" ||
                hostname === "www.facebook.com" ||
                hostname === "fb.com" ||
                hostname === "www.fb.com" ||
                hostname === "m.facebook.com"
              );
            } catch {
              return false;
            }
          },
          {
            message: i18n("Please enter a valid {name} URL (e.g., {example})", {
              example: "facebook.com/your-event",
              name: "Facebook",
            }),
          },
        )
        .optional()
        .nullable(),

      instagram: z
        .string()
        .refine(
          (val) => {
            if (!val) return true;
            try {
              const url = new URL(val);
              const hostname = url.hostname.toLowerCase();
              return (
                hostname === "instagram.com" ||
                hostname === "www.instagram.com" ||
                hostname === "instagr.am" ||
                hostname === "www.instagr.am"
              );
            } catch {
              return false;
            }
          },
          {
            message: i18n("Please enter a valid {name} URL (e.g., {example})", {
              example: "instagram.com/your-event",
              name: "Instagram",
            }),
          },
        )
        .optional()
        .nullable(),

      // Admin fields (mostly read-only from form perspective)
      id: z.string().uuid().optional(),
      status: z.nativeEnum(Event_Status_Enum).default(Event_Status_Enum.PENDING).optional(),
      user_id: z.string().uuid().optional(),
      owner_id: z.string().uuid().optional(),

      // Event tags (many-to-many relationship)
      event_tags: z.array(z.string().uuid()).optional().nullable(),
    })
    .refine(
      (data) => {
        // If end_date is provided, it must be after start_date
        if (!data.end_date) return true;
        const start = typeof data.start_date === "string" ? new Date(data.start_date) : data.start_date;
        const end = typeof data.end_date === "string" ? new Date(data.end_date) : data.end_date;
        return end > start;
      },
      {
        message: i18n("End date must be after start date"),
        path: ["end_date"],
      },
    )
    .refine(
      (data) => {
        // At least one location type must be specified
        return data.venue_id || data.custom_location_name || data.is_online;
      },
      {
        message: i18n("Please specify a venue, custom location, or mark as online event"),
        path: ["venue_id"],
      },
    )
    .refine(
      (data) => {
        // If price_type is PAID or SUGGESTED_DONATION, price_amount is required
        if (data.price_type === Price_Type_Enum.PAID || data.price_type === Price_Type_Enum.SUGGESTED_DONATION) {
          return data.price_amount !== null && data.price_amount !== undefined && data.price_amount > 0;
        }
        return true;
      },
      {
        message: i18n("Price amount is required for paid events"),
        path: ["price_amount"],
      },
    );
};

export type EventFormData = z.infer<EventSchema>;
export type EventSchema = ReturnType<typeof getEventSchema>;

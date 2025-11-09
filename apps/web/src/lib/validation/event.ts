import { z } from "zod";

import { getI18n } from "~/i18n/getI18n";
import { isEmail, isWebsite, validatePhoneNumber } from "~/lib/utils";
import { Event_Status_Enum, Event_Type_Enum, Price_Type_Enum } from "~/types";

import { FACEBOOK_HOSTS, INSTAGRAM_HOSTS, validateHost } from "./utils/social-links";

const MAX_IMAGES = 3;

export const eventDescriptionMaxCharsCount = 1500;

export const getEventSchema = (i18n: Awaited<ReturnType<typeof getI18n>>) => {
  return z
    .object({
      accessibility_info: z.string().max(500, i18n("Accessibility info is too long")).optional().nullable(),

      age_restriction: z.string().max(50, i18n("Age restriction is too long")).optional().nullable(),

      area: z.string().optional().nullable(),

      capacity: z
        .union([z.string().transform((val) => Number.parseInt(val, 10)), z.number()])
        .pipe(z.number().int(i18n("Capacity must be a whole number")).min(1, i18n("Capacity must be at least 1")))
        .optional()
        .nullable(),
      city: z.string().optional().nullable(),

      country: z.string().optional().nullable(),
      custom_location_address: z.string().min(3, i18n("Address is required")).optional().nullable(),
      custom_location_name: z.string().max(200, i18n("Location name is too long")).optional().nullable(),

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

      // Event tags (many-to-many relationship)
      event_tags: z.array(z.string().uuid()).optional().nullable(),

      external_url: z
        .string()
        .refine((val) => !val || val.trim() === "" || isWebsite(val), {
          message: i18n("External URL is invalid"),
        })
        .optional()
        .nullable(),

      facebook: z
        .string()
        .refine((val) => validateHost(val, FACEBOOK_HOSTS), {
          message: i18n("Please enter a valid {name} URL (e.g., {example})", {
            example: "facebook.com/your-event",
            name: "Facebook",
          }),
        })
        .optional()
        .nullable(),

      // Admin fields (mostly read-only from form perspective)
      id: z.string().uuid().optional(),

      // Media
      image: z.preprocess((val) => (val === "" ? null : val), z.instanceof(File).optional().nullable()),

      images: z
        .array(z.instanceof(File))
        .max(MAX_IMAGES, i18n("Maximum is {MAX_IMAGES} images.", { MAX_IMAGES }))
        .optional()
        .nullable(),

      instagram: z
        .string()
        .refine((val) => validateHost(val, INSTAGRAM_HOSTS), {
          message: i18n("Please enter a valid {name} URL (e.g., {example})", {
            example: "instagram.com/your-event",
            name: "Instagram",
          }),
        })
        .optional()
        .nullable(),

      is_online: z.coerce.boolean().default(false).optional(),

      is_recurring: z.coerce.boolean().default(false).optional(),

      // Social & Metadata
      language: z.array(z.string()).optional().nullable(),

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

      organizer_email: z
        .string()
        .refine(
          (email) => {
            const trimmed = email.trim();
            return trimmed === "" || isEmail(trimmed);
          },
          {
            message: i18n("Invalid email address"),
          },
        )
        .optional()
        .nullable(),

      organizer_name: z.string().max(200, i18n("Organizer name is too long")).optional().nullable(),

      organizer_phone_number: z
        .string()
        .refine(
          (phone) => {
            const trimmed = phone.trim();
            return trimmed === "" || validatePhoneNumber(trimmed);
          },
          {
            message: i18n("Invalid phone number"),
          },
        )
        .optional()
        .nullable(),

      price_amount: z
        .union([z.string().transform((val) => Number.parseFloat(val)), z.number()])
        .pipe(z.number().min(0, i18n("Price must be 0 or greater")))
        .optional()
        .nullable(),

      price_currency: z
        .string()
        .length(3, i18n("Currency must be a 3-letter code (e.g., EUR, GBP)"))
        .default("EUR")
        .nullable(),

      price_type: z.enum(Object.values(Price_Type_Enum), {
        message: i18n("Please choose a price type"),
      }),

      recurrence_rule: z.string().max(200, i18n("Recurrence rule is too long")).optional().nullable(),

      registration_required: z.coerce.boolean().default(false).optional(),

      registration_url: z
        .string()
        .refine((val) => !val || isWebsite(val), {
          message: i18n("Registration URL is invalid"),
        })
        .optional()
        .nullable(),

      slug: z
        .string()
        .min(10, i18n("Slug must be at least 10 characters"))
        .max(150, i18n("Slug must be less than 150 characters"))
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, i18n("Slug must contain only lowercase letters, numbers, and hyphens")),

      start_date: z.union([z.string(), z.date()]).refine(
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

      status: z.enum(Object.values(Event_Status_Enum)).default(Event_Status_Enum.Pending).optional(),
      title_en: z.string().min(1, i18n("Title is required")).trim(),
      title_uk: z.string().min(1, i18n("Title is required")).trim(),
      type: z.enum(Object.values(Event_Type_Enum), {
        message: i18n("Please choose an event type"),
      }),

      venue_id: z
        .union([z.uuid(i18n("Invalid venue ID")), z.literal("")])
        .transform((val) => (val === "" ? null : val))
        .optional()
        .nullable(),
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
        // For online events, external_url is required
        if (data.is_online) {
          return !!data.external_url && data.external_url.trim() !== "";
        }
        return true;
      },
      {
        message: i18n("External URL is required for online events"),
        path: ["external_url"],
      },
    )
    .refine(
      (data) => {
        // For non-online events, at least venue_id or custom_location_name is required
        if (!data.is_online) {
          return !!data.venue_id || !!data.custom_location_name;
        }
        return true;
      },
      {
        message: i18n("Please specify a venue or custom location"),
        path: ["venue_id"],
      },
    )
    .refine(
      (data) => {
        // If price_type is PAID or SUGGESTED_DONATION, price_amount is required
        if (data.price_type === Price_Type_Enum.Paid || data.price_type === Price_Type_Enum.SuggestedDonation) {
          return data.price_amount !== null && data.price_amount !== undefined && data.price_amount > 0;
        }
        return true;
      },
      {
        message: i18n("Price amount is required"),
        path: ["price_amount"],
      },
    );
};

export type EventFormData = z.infer<EventSchema>;
export type EventSchema = ReturnType<typeof getEventSchema>;

import { z } from "zod";

import { getI18n } from "~/i18n/getI18n";
import { isEmail, isWebsite, validatePhoneNumber } from "~/lib/utils";
import { Venue_Category_Enum } from "~/types";

import { constants } from "../constants";
import { FACEBOOK_HOSTS, INSTAGRAM_HOSTS, validateHost } from "./utils/social-links";

const MAX_IMAGES = 6;

const venueScheduleItemSchema = z
  .object({
    close_time: z.string(),
    day_of_week: z.enum(constants.weekdays.map((d) => d.full.en)),
    id: z.uuid().optional(),
    open_time: z.string(),
  })
  .refine(
    (data) => {
      // Both empty is valid (closed that day)
      if (!data.open_time && !data.close_time) {
        return true;
      }

      // Both must be provided together
      if (!data.open_time || !data.close_time) {
        return false;
      }

      // Just validate the time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]/;
      return timeRegex.test(data.open_time) && timeRegex.test(data.close_time);
    },
    {
      message: "Invalid time format. Use HH:MM format",
      path: ["open_time"],
    },
  );

const venueSchedulesSchema = z
  .array(venueScheduleItemSchema)
  .transform((schedules) => {
    if (!schedules) return undefined;
    // Filter out incomplete schedules (ones with empty times)
    return schedules.filter((s) => s.open_time && s.close_time);
  })
  .optional();

const venueAccommodationDetailsSchema = z
  .object({
    amenities: z
      .array(z.enum(constants.options.AMENITIES.map((amenity) => amenity.value)))
      .optional()
      .nullable(),
    bathrooms: z.number().nonnegative().optional().nullable(),
    bedrooms: z.number().int().nonnegative().optional().nullable(),
    check_in_time: z.string().optional().nullable(),
    check_out_time: z.string().optional().nullable(),
    max_guests: z.number().int().positive().optional().nullable(),
    minimum_stay_nights: z.number().int().positive().optional().nullable(),
  })
  .optional();

const beautyBeautySalonDetailsSchema = z
  .object({
    appointment_required: z.boolean().optional().nullable(),
    services: z
      .array(z.enum(constants.options.BEAUTY_SERVICES.map((service) => service.value)))
      .optional()
      .nullable(),
    walk_ins_accepted: z.boolean().optional().nullable(),
  })
  .optional();

const restaurantDetailsSchema = z
  .object({
    cuisine_types: z
      .array(z.enum(constants.options.CUISINE.map((cuisine) => cuisine.value)))
      .optional()
      .nullable(),
    features: z
      .array(z.enum(constants.options.FEATURES.map((feature) => feature.value)))
      .optional()
      .nullable(),
    price_range: z
      .enum(constants.options.PRICE_RANGE.map((option) => option.value))
      .optional()
      .nullable(),
    seating_capacity: z.number().int().positive().optional().nullable(),
  })
  .optional();

const schoolDetailsSchema = z
  .object({
    age_groups: z
      .array(z.enum(constants.options.AGE_GROUPS.map((option) => option.value)))
      .optional()
      .nullable(),
    class_size_max: z.number().int().positive().optional().nullable(),
    languages_taught: z
      .array(z.enum(constants.options.LANGUAGES.map((option) => option.value)))
      .optional()
      .nullable(),
    online_classes_available: z.boolean().optional().nullable(),
    subjects: z
      .array(z.enum(constants.options.CURRICULUM.map((option) => option.value)))
      .optional()
      .nullable(),
  })
  .optional();

const shopDetailsSchema = z
  .object({
    payment_methods: z
      .array(z.enum(constants.options.PAYMENT.map((option) => option.value)))
      .optional()
      .nullable(),
    product_categories: z
      .array(z.enum(constants.options.PRODUCT_CATEGORIES.map((category) => category.value)))
      .optional(),
  })
  .optional();

export const venueDescriptionMaxCharsCount = 3000;

export const getVenueSchema = (i18n: Awaited<ReturnType<typeof getI18n>>) => {
  return z.object({
    address: z.string().min(3, i18n("Address is required")).optional().nullable(),

    area: z.string().optional().nullable(),
    category: z.enum(Object.values(Venue_Category_Enum), {
      message: i18n("Please choose a category"),
    }),
    city: z.string().optional().nullable(),
    country: z.string().optional().nullable(),

    description_en: z
      .string()
      .max(venueDescriptionMaxCharsCount, i18n("Description is too long"))
      .optional()
      .nullable(),
    description_uk: z
      .string()
      .max(venueDescriptionMaxCharsCount, i18n("Description is too long"))
      .optional()
      .nullable(),
    emails: z
      .array(
        z.string().refine(
          (email) => {
            const trimmed = email.trim();
            return trimmed === "" || isEmail(trimmed);
          },
          {
            message: i18n("Invalid email address"),
          },
        ),
      )
      .optional()
      .nullable(),
    facebook: z
      .string()
      .refine((val) => validateHost(val, FACEBOOK_HOSTS), {
        message: i18n("Please enter a valid {name} URL (e.g., {example})", {
          example: "facebook.com/your-page",
          name: "Facebook",
        }),
      })
      .optional()
      .nullable(),
    id: z.string().optional(),

    images: z
      .array(z.instanceof(File))
      .max(MAX_IMAGES, i18n("Maximum is {MAX_IMAGES} images.", { MAX_IMAGES }))
      .optional()
      .nullable(),

    instagram: z
      .string()
      .refine((val) => validateHost(val, INSTAGRAM_HOSTS), {
        message: i18n("Please enter a valid {name} URL (e.g., {example})", {
          example: "instagram.com/your-profile",
          name: "Instagram",
        }),
      })
      .optional()
      .nullable(),

    is_owner: z.coerce.boolean().optional(),

    is_physical: z.coerce.boolean().optional(),

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

    logo: z.preprocess((val) => (val === "" ? null : val), z.instanceof(File).optional().nullable()),

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

    // Keep metadata as optional for backwards compatibility with existing metadata components
    // TODO: Remove when metadata is fully migrated to separate tables
    metadata: z.any().optional().nullable(),

    name: z.string().min(1, i18n("Name is required")).max(100, i18n("Name must be less than 100 characters")),

    phone_numbers: z
      .array(
        z.string().refine(
          (phone) => {
            const trimmed = phone.trim();
            return trimmed === "" || validatePhoneNumber(trimmed);
          },
          {
            message: i18n("Invalid phone number"),
          },
        ),
      )
      .optional()
      .nullable(),

    postcode: z.string().optional().nullable(),

    slug: z
      .string()
      .min(10, i18n("Slug must be at least 10 characters"))
      .max(150, i18n("Slug must be less than 150 characters"))
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, i18n("Slug must contain only lowercase letters, numbers, and hyphens")),

    venue_accommodation_details: venueAccommodationDetailsSchema,

    venue_beauty_salon_details: beautyBeautySalonDetailsSchema,
    venue_restaurant_details: restaurantDetailsSchema,
    venue_schedules: venueSchedulesSchema,
    venue_school_details: schoolDetailsSchema,
    venue_shop_details: shopDetailsSchema,
    website: z
      .string()
      .refine((val) => !val || isWebsite(val), {
        message: i18n("Website is invalid"),
      })
      .optional()
      .nullable(),
  });
};

export type VenueFormData = z.infer<VenueSchema>;
export type VenueSchema = ReturnType<typeof getVenueSchema>;

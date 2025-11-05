import { z } from "zod";

import { getI18n } from "~/i18n/getI18n";
import { isEmail, isWebsite, validatePhoneNumber } from "~/lib/utils";
import { Venue_Category_Enum } from "~/types";

import { FACEBOOK_HOSTS, INSTAGRAM_HOSTS, validateHost } from "./utils/social-links";

const MAX_IMAGES = 6;

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

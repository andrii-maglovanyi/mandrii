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
import { UserModel } from "~/lib/models";
import { saveVenue } from "~/lib/models/venue";
import { upsertVenueAccommodationDetails } from "~/lib/models/venue-accomodation-details";
import { upsertVenueBeautySalonDetails } from "~/lib/models/venue-beauty-salon-details";
import { upsertVenueRestaurantDetails } from "~/lib/models/venue-restaurant-details";
import { upsertVenueSchedules } from "~/lib/models/venue-schedule";
import { upsertVenueSchoolDetails } from "~/lib/models/venue-school-details";
import { upsertVenueShopDetails } from "~/lib/models/venue-shop-details";
import { sendSlackNotification } from "~/lib/slack/venue";
import { constructSlug } from "~/lib/utils";
import { processImages } from "~/lib/utils/images";
import { getVenueSchema } from "~/lib/validation/venue";
import {
  Venue_Accommodation_Details,
  Venue_Beauty_Salon_Details,
  Venue_Category_Enum,
  Venue_Restaurant_Details,
  Venue_Schedule,
  Venue_School_Details,
  Venue_Shop_Details,
  Venues,
} from "~/types";
import { Time } from "~/types/timestamp";
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
      venue_accommodation_details,
      venue_beauty_salon_details,
      venue_restaurant_details,
      venue_schedules,
      venue_school_details,
      venue_shop_details,
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

    const venueSchedules: Array<Partial<Venue_Schedule>> =
      venue_schedules?.map(({ close_time, day_of_week, open_time }) => ({
        close_time: close_time as Time,
        day_of_week,
        open_time: open_time as Time,
      })) || [];

    if (data.id) {
      venueData.id = data.id as UUID;
    } else {
      const isSlugUnique = await checkIsSlugUnique(slug);

      if (!isSlugUnique) {
        throw new ValidationError("Invalid input", [
          { code: "custom", message: i18n("Slug is already taken"), path: ["slug"] },
        ]);
      }

      venueData.slug = slug.length >= 10 ? slug.trim() : constructSlug(category, name, area?.split(",")[0]?.trim());
    }

    if (address) {
      const geo = await geocodeAddress(address.trim(), privateConfig.maps.apiKey);

      if (!geo) {
        throw new BadRequestError("Address not found");
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
      throw new InternalServerError("Failed to save venue - no ID returned");
    }

    // Accommodation details
    if (venueData.category === Venue_Category_Enum.Accommodation && venue_accommodation_details) {
      const accommodationDetails: Partial<Venue_Accommodation_Details> = {
        ...venue_accommodation_details,
        amenities: venue_accommodation_details?.amenities as Venue_Accommodation_Details["amenities"],
        check_in_time: venue_accommodation_details?.check_in_time as Time,
        check_out_time: venue_accommodation_details?.check_out_time as Time,
      };

      const affectedRows = await upsertVenueAccommodationDetails(venueId, accommodationDetails, session);

      if (!affectedRows) {
        throw new InternalServerError("Failed to upsert venue accommodation details");
      }
    }

    // Beauty Salon details
    if (venueData.category === Venue_Category_Enum.BeautySalon && venue_beauty_salon_details) {
      const beautySalonDetails = {
        ...venue_beauty_salon_details,
        services: venue_beauty_salon_details?.services as Venue_Beauty_Salon_Details["services"],
      };

      const affectedRows = await upsertVenueBeautySalonDetails(venueId, beautySalonDetails, session);
      if (!affectedRows) {
        throw new InternalServerError("Failed to upsert venue beauty salon details");
      }
    }

    // Restaurant details
    if (venueData.category === Venue_Category_Enum.Restaurant && venue_restaurant_details) {
      const restaurantDetails = {
        ...venue_restaurant_details,
        cuisine_types: venue_restaurant_details?.cuisine_types as Venue_Restaurant_Details["cuisine_types"],
        features: venue_restaurant_details?.features as Venue_Restaurant_Details["features"],
        price_range: venue_restaurant_details?.price_range,
      };

      const affectedRows = await upsertVenueRestaurantDetails(venueId, restaurantDetails, session);
      if (!affectedRows) {
        throw new InternalServerError("Failed to upsert venue restaurant details");
      }
    }

    // School details
    if (venueData.category === Venue_Category_Enum.School && venue_school_details) {
      const schoolDetails = {
        ...venue_school_details,
        age_groups: venue_school_details?.age_groups as Venue_School_Details["age_groups"],
        languages_taught: venue_school_details?.languages_taught as Venue_School_Details["languages_taught"],
        subjects: venue_school_details?.subjects as Venue_School_Details["subjects"],
      };

      const affectedRows = await upsertVenueSchoolDetails(venueId, schoolDetails, session);
      if (!affectedRows) {
        throw new InternalServerError("Failed to upsert venue school details");
      }
    }

    // Shop details
    if (venueData.category === Venue_Category_Enum.Shop && venue_shop_details) {
      const shopDetails = {
        ...venue_shop_details,
        payment_methods: venue_shop_details?.payment_methods as Venue_Shop_Details["payment_methods"],
        product_categories: venue_shop_details?.product_categories as Venue_Shop_Details["product_categories"],
      };

      const affectedRows = await upsertVenueShopDetails(venueId, shopDetails, session);
      if (!affectedRows) {
        throw new InternalServerError("Failed to upsert venue shop details");
      }
    }

    if (venueSchedules.length) {
      const affectedRows = await upsertVenueSchedules(venueId, venueSchedules, session);

      if (!affectedRows) {
        throw new InternalServerError("Failed to upsert venue schedules");
      }
    }

    if (!venueData.id) {
      try {
        const userModel = new UserModel(session);
        await userModel.incrementVenueCreation();
      } catch (error) {
        console.error("Failed to increment venue creation count:", error);
      }
    }

    sendSlackNotification(session.user, venueData).catch((error) => {
      console.error("Slack notification failed (non-critical):", error);
    });

    return NextResponse.json({ id: venueId, success: true }, { status: 200 });
  });

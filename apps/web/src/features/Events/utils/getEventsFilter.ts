import { Event_Type_Enum, FilterParams, Price_Type_Enum } from "~/types";

interface EventsParams {
  dateFrom?: string;
  dateTo?: string;
  distance?: string;
  geo?: {
    lat: number;
    lng: number;
  };
  isOnline?: boolean;
  name?: string;
  priceType?: Price_Type_Enum;
  slug?: string;
  type?: Event_Type_Enum;
}

export const getEventsFilter = ({
  dateFrom,
  dateTo,
  distance,
  geo,
  isOnline,
  name,
  priceType,
  slug,
  type,
}: EventsParams) => {
  const where: FilterParams = {};

  if (slug) {
    where.slug = { _eq: slug };
    return { variables: { where } };
  }

  if (isOnline !== undefined) {
    where.is_online = { _eq: isOnline };
  }

  if (type) {
    where.type = { _eq: type };
  }

  if (priceType) {
    where.price_type = { _eq: priceType };
  }

  // Date range filter - only show upcoming/ongoing events
  const now = new Date().toISOString();
  if (dateFrom) {
    where._or = [{ end_date: { _gte: dateFrom } }, { start_date: { _gte: dateFrom } }];
  } else {
    where._or = [{ end_date: { _gte: now } }, { start_date: { _gte: now } }];
  }

  if (dateTo) {
    where._or = where._or?.map((condition) => {
      if ("end_date" in condition) {
        return { end_date: { ...condition.end_date, _lte: dateTo } };
      }
      if ("start_date" in condition) {
        return { start_date: { ...condition.start_date, _lte: dateTo } };
      }
      return condition;
    });
  }

  if (geo && isOnline !== true) {
    const geoFilter = {
      _st_d_within: {
        distance: distance || "100000", // default to 100km if distance not provided
        from: {
          coordinates: [geo.lng, geo.lat] as [number, number],
          type: "Point" as const,
        },
      },
    };

    where._and = [
      {
        _or: [{ geo: geoFilter }, { venue: { geo: geoFilter } }],
      },
    ];
  }

  if (name) {
    where._or = [
      { title_en: { _ilike: `%${name}%` } },
      { title_uk: { _ilike: `%${name}%` } },
      { description_en: { _ilike: `%${name}%` } },
      { description_uk: { _ilike: `%${name}%` } },
      { area: { _ilike: `%${name}%` } },
      { city: { _ilike: `%${name}%` } },
      { custom_location_address: { _ilike: `%${name}%` } },
      { venue: { name: { _ilike: `%${name}%` } } },
    ];
  }

  return { variables: { where } };
};

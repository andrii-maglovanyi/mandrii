const MIN_RADIUS_METERS = 1_000;
const MAX_RADIUS_METERS = 100_000;

export type SavedMapArea = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
};

type SearchParams = Pick<URLSearchParams, "get">;

/** Reads only valid, bounded map state from a shared area-follow link. */
export const getSavedMapArea = (searchParams: SearchParams): SavedMapArea | null => {
  const latitude = Number(searchParams.get("areaLat"));
  const longitude = Number(searchParams.get("areaLng"));
  const radiusMeters = Number(searchParams.get("areaRadius"));

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !Number.isInteger(radiusMeters) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    radiusMeters < MIN_RADIUS_METERS ||
    radiusMeters > MAX_RADIUS_METERS
  ) {
    return null;
  }

  return { latitude, longitude, radiusMeters };
};

export const getSavedMapAreaHref = (
  { latitude, longitude, radiusMeters }: SavedMapArea,
  view: "events" | "venues" = "venues",
) => {
  const params = new URLSearchParams({
    areaLat: String(latitude),
    areaLng: String(longitude),
    areaRadius: String(radiusMeters),
  });
  return `/map?${params}#${view}`;
};

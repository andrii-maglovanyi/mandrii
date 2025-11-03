import { privateConfig } from "~/lib/config/private";
import { fetchVenueBySlug } from "~/lib/graphql/queries";
import { getLatitudeBounds, getLongitudeBounds } from "~/lib/utils";

export const checkIsSlugUnique = async (slug: string): Promise<boolean> => {
  const venue = await fetchVenueBySlug(slug, privateConfig.hasura.adminSecret);
  return venue === null;
};

export const checkCoordinatesWithinRange = (
  referenceCoordinates: [number, number],
  givenCoordinates: [number, number],
) => {
  const [refLng, refLat] = referenceCoordinates;
  const [givenLng, givenLat] = givenCoordinates;

  const bounds = {
    latitude: getLatitudeBounds(refLat),
    longitude: getLongitudeBounds(refLat, refLng),
  };

  if (
    givenLat < bounds.latitude.minLat ||
    givenLat > bounds.latitude.maxLat ||
    givenLng < bounds.longitude.minLng ||
    givenLng > bounds.longitude.maxLng
  ) {
    throw new Error("Coordinates are out of acceptable range from the address");
  }

  return true;
};

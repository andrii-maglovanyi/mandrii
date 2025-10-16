import { privateConfig } from "~/lib/config/private";
import { publicConfig } from "~/lib/config/public";
import { getLatitudeBounds, getLongitudeBounds } from "~/lib/utils";

const GET_VENUE_BY_SLUG = `
  query GetVenueBySlug($slug: String!) {
    venues(where: { slug: { _eq: $slug } }, limit: 1) {
      id
    }
  }
`;

export const checkIsSlugUnique = async (slug: string): Promise<boolean> => {
  const response = await fetch(publicConfig.hasura.endpoint, {
    body: JSON.stringify({ query: GET_VENUE_BY_SLUG, variables: { slug } }),
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": privateConfig.hasura.adminSecret,
    },
    method: "POST",
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.venues.length === 0;
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

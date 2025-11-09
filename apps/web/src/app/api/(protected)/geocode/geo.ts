import removeAccents from "remove-accents";

import { extractLocationData } from "./utils";

const AREA_HIERARCHY = [
  "neighbourhood",
  "quarter",
  "suburb",
  "village",
  "hamlet",
  "locality",
  "island",
  "town",
  "city_district",
  "city",
  "municipality",
  "county",
  "state_district",
  "state",
  "region",
  "province",
  "country",
];

interface OSMRequestOptions {
  address?: string;
  lang?: string;
  lat?: number;
  lon?: number;
}

const fetchFromOSM = async (options: OSMRequestOptions) => {
  const { address, lang = "en", lat, lon } = options;

  const headers = {
    "User-Agent": "Mandrii/1.x",
  };

  // Try address search first
  if (address) {
    try {
      const searchUrl = `https://nominatim.osm.org/search?q=${encodeURIComponent(
        address,
      )}&format=json&addressdetails=1&limit=1&accept-language=${lang}`;

      const response = await fetch(searchUrl, { headers });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (error) {
      console.error(`OSM search by address failed (${lang}):`, error);
    }
  }

  // Fallback to reverse geocoding if coordinates are available
  if (lat !== undefined && lon !== undefined) {
    try {
      const reverseUrl = `https://nominatim.osm.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=${lang}`;

      const response = await fetch(reverseUrl, { headers });

      if (response.ok) {
        const data = await response.json();
        if (data && !data.error) {
          return [data]; // Wrap in array to match search format
        }
      }
    } catch (error) {
      console.error(`OSM reverse geocoding error (${lang}):`, error);
    }
  }

  return null;
};

/**
 * Fetches and extracts area information from OpenStreetMap in the given language.
 */
const getAreaFromOSM = async (
  locationData: ReturnType<typeof extractLocationData>,
  fullArea = false,
  lang = "en",
): Promise<null | string[]> => {
  if (!locationData?.address && !locationData?.coordinates.length) {
    return locationData?.area ? [locationData.area] : null;
  }

  try {
    const osmData = await fetchFromOSM({
      address: locationData.address,
      lang,
      lat: locationData.coordinates[1],
      lon: locationData.coordinates[0],
    });

    if (!osmData) {
      return locationData.area ? [locationData.area] : null;
    }

    const address = osmData[0]?.address || {};
    const areaParts = AREA_HIERARCHY.map((key) => address[key]).filter(Boolean);

    if (fullArea) {
      return [...new Set([...areaParts, locationData.area].filter(Boolean))];
    }

    // Return smallest available area as single-element array
    return areaParts.length ? [areaParts[0]] : locationData.area ? [locationData.area] : null;
  } catch (error) {
    console.error("Error extracting area from OSM:", error);
    return locationData.area ? [locationData.area] : null;
  }
};

/**
 * Fetches combined area data (EN + UK) and returns both full and slug-friendly versions.
 */
const getCombinedAreaFromOSM = async (
  locationData: ReturnType<typeof extractLocationData>,
): Promise<{ area: null | string }> => {
  const [enArea, ukArea] = await Promise.all([
    getAreaFromOSM(locationData, true, "en"),
    getAreaFromOSM(locationData, true, "uk"),
  ]);

  const allAreas = [...(enArea || []), ...(ukArea || [])];

  if (allAreas.length === 0) {
    return { area: null };
  }

  // Add accent-free versions
  const withAccentFree = [...allAreas, ...allAreas.map((area) => removeAccents(area))];

  // Remove duplicates (case-sensitive comparison)
  const merged = [...new Set(withAccentFree)];

  return {
    area: merged.join(", "),
  };
};

/**
 * Geocodes an address using Google Maps API and enriches it with OSM data.
 */
export const geocodeAddress = async (address: string, apiKey: string) => {
  const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address,
  )}&key=${apiKey}`;

  try {
    const googleResponse = await fetch(googleUrl);
    if (!googleResponse.ok) {
      throw new Error(`Google API error: ${googleResponse.statusText}`);
    }

    const googleData = await googleResponse.json();
    if (googleData.status !== "OK") {
      console.error(`Geocoding failed: ${googleData.status}`);
      return null;
    }

    const locationData = extractLocationData(googleData);
    if (!locationData) return null;

    const { area } = await getCombinedAreaFromOSM(locationData);

    return {
      ...locationData,
      area,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

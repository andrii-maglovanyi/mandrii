import { extractLocationData } from "./utils";

interface GeocodeOptions {
  fullArea?: boolean;
  lang?: string; // main language preference (default 'en')
}

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

/**
 * Fetches and extracts area information from OpenStreetMap in the given language.
 */
const getAreaFromOSM = async (
  locationData: ReturnType<typeof extractLocationData>,
  fullArea = false,
  lang = "en",
): Promise<null | string[]> => {
  if (!locationData?.address) return locationData?.area ? [locationData.area] : null;

  try {
    const osmUrl = `https://nominatim.osm.org/search?q=${encodeURIComponent(
      locationData.address,
    )}&format=json&addressdetails=1&limit=1&accept-language=${lang}`;

    const osmResponse = await fetch(osmUrl, {
      headers: {
        "User-Agent": "Mandrii/1.x",
      },
    });
    if (!osmResponse.ok) {
      console.error("OSM request failed:", osmResponse.status, osmResponse.statusText);
      return locationData.area ? [locationData.area] : null;
    }

    const osmData = await osmResponse.json();
    if (!Array.isArray(osmData) || osmData.length === 0) {
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
 * Fetches combined area data (EN + UK) if fullArea = true.
 */
const getCombinedAreaFromOSM = async (
  locationData: ReturnType<typeof extractLocationData>,
  fullArea = false,
): Promise<null | string> => {
  if (!fullArea) {
    const area = await getAreaFromOSM(locationData, false, "en");
    return area?.[0] || null;
  }

  // Run both requests in parallel
  const [enArea, ukArea] = await Promise.all([
    getAreaFromOSM(locationData, true, "en"),
    getAreaFromOSM(locationData, true, "uk"),
  ]);

  // Merge and deduplicate
  const merged = [...new Set([...(enArea || []), ...(ukArea || [])])];
  return merged.length ? merged.join(", ") : null;
};

/**
 * Geocodes an address using Google Maps API and enriches it with OSM data.
 */
export const geocodeAddress = async (address: string, apiKey: string, options: GeocodeOptions = {}) => {
  const { fullArea = false, lang = "en" } = options;

  const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address,
  )}&key=${apiKey}&language=${lang}`;

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

    locationData.area = await getCombinedAreaFromOSM(locationData, fullArea);

    return locationData;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

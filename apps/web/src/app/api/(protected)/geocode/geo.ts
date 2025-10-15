import { extractLocationData } from "./utils";

export const geocodeAddress = async (address: string, key: string) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      return extractLocationData(data);
    }
    console.error(`Geocoding failed: ${data.status}`);
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

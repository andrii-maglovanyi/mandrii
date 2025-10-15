export const getLatitudeBounds = (currentLat?: null | number, distanceMeters: number = 100) => {
  if (!currentLat) {
    return {
      maxLat: 90,
      minLat: -90,
    };
  }

  // Convert distance to degrees
  // 1 degree of latitude ≈ 111,320 meters (constant everywhere)
  const latDelta = distanceMeters / 111320;

  return {
    maxLat: +(currentLat + latDelta).toFixed(5),
    minLat: +(currentLat - latDelta).toFixed(5), // 5 decimal places ~ 1.1 meter precision
  };
};

export const getLongitudeBounds = (
  currentLat?: null | number,
  currentLng?: null | number,
  distanceMeters: number = 100,
) => {
  if (!(currentLat && currentLng)) {
    return {
      maxLng: 180,
      minLng: -180,
    };
  }
  // Longitude distance varies with latitude
  // At the equator: 1 degree longitude ≈ 111,320 meters
  // At latitude φ: 1 degree longitude ≈ 111,320 * cos(φ) meters

  const latRad = (currentLat * Math.PI) / 180;
  const metersPerDegreeLng = 111320 * Math.cos(latRad);

  // Convert distance to degrees longitude
  const lngDelta = distanceMeters / metersPerDegreeLng;

  return {
    maxLng: +(currentLng + lngDelta).toFixed(5),
    minLng: +(currentLng - lngDelta).toFixed(5),
  };
};

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodeResponse {
  results: {
    address_components: AddressComponent[];
    formatted_address: string;
    geometry: Geometry;
  }[];
  status: string;
}

interface Geometry {
  location: {
    lat: number;
    lng: number;
  };
}

export const extractLocationData = (response: GeocodeResponse) => {
  if (!response.results.length) return null;

  const res = response.results[0];

  let city: null | string = null;
  let country: null | string = null;
  let area: null | string = null;
  let postcode: null | string = null;
  const address = res.formatted_address;
  const { lat, lng } = res.geometry.location;
  const coordinates: [number, number] = [+lng.toFixed(5), +lat.toFixed(5)];

  for (const component of res.address_components) {
    if (component.types.includes("locality") || component.types.includes("postal_town")) {
      city = component.long_name;
    } else if (component.types.includes("country")) {
      country = component.long_name;
    } else if (component.types.includes("sublocality_level_1")) {
      area = component.short_name;
    } else if (component.types.includes("postal_code")) {
      postcode = component.short_name;
    }
  }

  if (!city || !country || !postcode || !address) return null;

  return { address, area, city, coordinates, country, postcode };
};

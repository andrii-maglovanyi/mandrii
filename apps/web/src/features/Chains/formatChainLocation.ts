export function formatChainLocation({ city, country }: { city: null | string; country: null | string }) {
  return [city, country].filter(Boolean).join(", ");
}

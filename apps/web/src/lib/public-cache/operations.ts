/** Only these fixed, public read operations may use the shared cache. */
export const PUBLIC_OPERATIONS = [
  "GetPublicVenues",
  "GetPublicVenueOptions",
  "GetVenueViewBySlug",
  "GetPublicEvents",
  "GetPublicEventSchedules",
] as const;

export type PublicOperation = (typeof PUBLIC_OPERATIONS)[number];
export const isPublicOperation = (name: string): name is PublicOperation =>
  PUBLIC_OPERATIONS.some((operation) => operation === name);

/** Stable serialization preserves array order (including sort precedence). */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, item[key]]),
        )
      : item,
  );
}

/** Shared lower bound for candidate schedules; renderers check exact expiry. */
export const discoveryWindowStart = () => new Date(Math.floor(Date.now() / 900_000) * 900_000).toISOString();

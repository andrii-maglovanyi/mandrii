export const CONTENT_SUBSCRIPTION_SCOPES = ["area", "event", "venue"] as const;

export type ContentSubscriptionScope = (typeof CONTENT_SUBSCRIPTION_SCOPES)[number];

export type ContentSubscriptionPreferences = {
  eventChangesEnabled: boolean;
  newEventsEnabled: boolean;
  newVenuesEnabled: boolean;
  updatesEnabled: boolean;
};

export type AreaSubscriptionTarget = {
  country: string;
  label: string;
  latitude: number;
  longitude: number;
  placeId: string;
  radiusMeters: number;
};

type BaseContentSubscription = ContentSubscriptionPreferences & {
  createdAt: string;
  id: string;
};

export type AreaContentSubscription = BaseContentSubscription & {
  scope: "area";
  target: AreaSubscriptionTarget;
};

export type EventContentSubscription = BaseContentSubscription & {
  scope: "event";
  target: {
    id: string;
    slug: string;
    titleEn: string;
    titleUk: string;
  };
};

export type VenueContentSubscription = BaseContentSubscription & {
  scope: "venue";
  target: {
    id: string;
    name: string;
    slug: string;
  };
};

export type ContentSubscription = AreaContentSubscription | EventContentSubscription | VenueContentSubscription;

export type CreateContentSubscriptionInput =
  | ({ scope: "area"; target: AreaSubscriptionTarget } & Partial<ContentSubscriptionPreferences>)
  | ({ scope: "event"; target: { id: string } } & Partial<ContentSubscriptionPreferences>)
  | ({ scope: "venue"; target: { id: string } } & Partial<ContentSubscriptionPreferences>);

export const DEFAULT_CONTENT_SUBSCRIPTION_PREFERENCES: ContentSubscriptionPreferences = {
  eventChangesEnabled: true,
  newEventsEnabled: true,
  newVenuesEnabled: true,
  updatesEnabled: true,
};

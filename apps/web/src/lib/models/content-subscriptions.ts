import type postgres from "postgres";

import { BadRequestError, NotFoundError } from "~/lib/api";
import sql from "~/lib/db/db";

import {
  type ContentSubscription,
  type ContentSubscriptionPreferences,
  type ContentSubscriptionScope,
  DEFAULT_CONTENT_SUBSCRIPTION_PREFERENCES,
  type CreateContentSubscriptionInput,
} from "../content-subscriptions/types";

const MAX_AREA_SUBSCRIPTIONS = 20;
const MAX_CONTENT_SUBSCRIPTIONS = 100;

type SubscriptionRow = {
  area_country: null | string;
  area_label: null | string;
  area_latitude: null | number;
  area_longitude: null | number;
  area_place_id: null | string;
  area_radius_meters: null | number;
  created_at: Date | string;
  event_changes_enabled: boolean;
  event_id: null | string;
  event_slug: null | string;
  event_title_en: null | string;
  event_title_uk: null | string;
  id: string;
  new_events_enabled: boolean;
  new_venues_enabled: boolean;
  updates_enabled: boolean;
  venue_id: null | string;
  venue_name: null | string;
  venue_slug: null | string;
};

const toSubscription = (row: SubscriptionRow): ContentSubscription => {
  const preferences = {
    eventChangesEnabled: row.event_changes_enabled,
    newEventsEnabled: row.new_events_enabled,
    newVenuesEnabled: row.new_venues_enabled,
    updatesEnabled: row.updates_enabled,
  };
  const base = { ...preferences, createdAt: new Date(row.created_at).toISOString(), id: row.id };

  if (row.venue_id && row.venue_name && row.venue_slug) {
    return { ...base, scope: "venue", target: { id: row.venue_id, name: row.venue_name, slug: row.venue_slug } };
  }

  if (row.event_id && row.event_slug && row.event_title_en && row.event_title_uk) {
    return {
      ...base,
      scope: "event",
      target: {
        id: row.event_id,
        slug: row.event_slug,
        titleEn: row.event_title_en,
        titleUk: row.event_title_uk,
      },
    };
  }

  if (
    row.area_place_id &&
    row.area_label &&
    row.area_country &&
    row.area_latitude !== null &&
    row.area_longitude !== null &&
    row.area_radius_meters !== null
  ) {
    return {
      ...base,
      scope: "area",
      target: {
        country: row.area_country,
        label: row.area_label,
        latitude: row.area_latitude,
        longitude: row.area_longitude,
        placeId: row.area_place_id,
        radiusMeters: row.area_radius_meters,
      },
    };
  }

  throw new Error(`Content subscription ${row.id} has an invalid target`);
};

const subscriptionFields = sql`
  subscription.id,
  subscription.created_at,
  subscription.updates_enabled,
  subscription.new_events_enabled,
  subscription.new_venues_enabled,
  subscription.event_changes_enabled,
  subscription.area_place_id,
  subscription.area_label,
  subscription.area_country,
  subscription.area_radius_meters,
  ST_Y(subscription.area_geo::geometry) AS area_latitude,
  ST_X(subscription.area_geo::geometry) AS area_longitude,
  venue.id AS venue_id,
  venue.name AS venue_name,
  venue.slug AS venue_slug,
  event.id AS event_id,
  event.slug AS event_slug,
  event.title_en AS event_title_en,
  event.title_uk AS event_title_uk
`;

export async function getContentSubscriptions(userId: string): Promise<ContentSubscription[]> {
  const rows = await sql<SubscriptionRow[]>`
    SELECT ${subscriptionFields}
    FROM content_subscriptions subscription
    LEFT JOIN venues venue ON venue.id = subscription.venue_id
    LEFT JOIN events event ON event.id = subscription.event_id
    WHERE subscription.user_id = ${userId}
    ORDER BY subscription.created_at DESC, subscription.id DESC
  `;

  return rows.map(toSubscription);
}

const preferencesFor = (input: Partial<ContentSubscriptionPreferences>): ContentSubscriptionPreferences => ({
  eventChangesEnabled: input.eventChangesEnabled ?? DEFAULT_CONTENT_SUBSCRIPTION_PREFERENCES.eventChangesEnabled,
  newEventsEnabled: input.newEventsEnabled ?? DEFAULT_CONTENT_SUBSCRIPTION_PREFERENCES.newEventsEnabled,
  newVenuesEnabled: input.newVenuesEnabled ?? DEFAULT_CONTENT_SUBSCRIPTION_PREFERENCES.newVenuesEnabled,
  updatesEnabled: input.updatesEnabled ?? DEFAULT_CONTENT_SUBSCRIPTION_PREFERENCES.updatesEnabled,
});

async function assertCapacity(
  transaction: postgres.TransactionSql,
  userId: string,
  scope: ContentSubscriptionScope,
  hasExistingSubscription: boolean,
) {
  if (hasExistingSubscription) return;

  const [counts] = await transaction<Array<{ area_count: number; total_count: number }>>`
    SELECT COUNT(*)::int AS total_count,
           COUNT(*) FILTER (WHERE area_place_id IS NOT NULL)::int AS area_count
    FROM content_subscriptions
    WHERE user_id = ${userId}
  `;

  if ((counts?.total_count ?? 0) >= MAX_CONTENT_SUBSCRIPTIONS) {
    throw new BadRequestError("You can follow up to 100 places, events and areas");
  }

  if (scope === "area" && (counts?.area_count ?? 0) >= MAX_AREA_SUBSCRIPTIONS) {
    throw new BadRequestError("You can follow up to 20 areas");
  }
}

export async function createContentSubscription(userId: string, input: CreateContentSubscriptionInput) {
  const preferences = preferencesFor(input);

  return sql.begin(async (transaction) => {
    await transaction`SELECT pg_advisory_xact_lock(hashtext(${`content-subscriptions:${userId}`}))`;

    if (input.scope === "venue") {
      const [existing] = await transaction<{ id: string }[]>`
        SELECT id FROM content_subscriptions
        WHERE user_id = ${userId} AND venue_id = ${input.target.id}
      `;
      await assertCapacity(transaction, userId, input.scope, Boolean(existing));

      const [subscription] = await transaction<{ id: string }[]>`
        INSERT INTO content_subscriptions (
          user_id, venue_id, updates_enabled, new_events_enabled, new_venues_enabled, event_changes_enabled
        )
        SELECT ${userId}, venue.id, ${preferences.updatesEnabled}, ${preferences.newEventsEnabled}, ${preferences.newVenuesEnabled}, ${preferences.eventChangesEnabled}
        FROM venues venue
        WHERE venue.id = ${input.target.id} AND venue.status IN ('ACTIVE', 'ARCHIVED')
        ON CONFLICT (user_id, venue_id) WHERE venue_id IS NOT NULL
        DO UPDATE SET
          updates_enabled = COALESCE(${input.updatesEnabled ?? null}, content_subscriptions.updates_enabled),
          new_events_enabled = COALESCE(${input.newEventsEnabled ?? null}, content_subscriptions.new_events_enabled),
          new_venues_enabled = COALESCE(${input.newVenuesEnabled ?? null}, content_subscriptions.new_venues_enabled),
          event_changes_enabled = COALESCE(${input.eventChangesEnabled ?? null}, content_subscriptions.event_changes_enabled)
        RETURNING id
      `;
      if (!subscription) throw new NotFoundError("The venue is not available to follow");
      return subscription.id;
    }

    if (input.scope === "event") {
      const [existing] = await transaction<{ id: string }[]>`
        SELECT id FROM content_subscriptions
        WHERE user_id = ${userId} AND event_id = ${input.target.id}
      `;
      await assertCapacity(transaction, userId, input.scope, Boolean(existing));

      const [subscription] = await transaction<{ id: string }[]>`
        INSERT INTO content_subscriptions (
          user_id, event_id, updates_enabled, new_events_enabled, new_venues_enabled, event_changes_enabled
        )
        SELECT ${userId}, event.id, ${preferences.updatesEnabled}, ${preferences.newEventsEnabled}, ${preferences.newVenuesEnabled}, ${preferences.eventChangesEnabled}
        FROM events event
        WHERE event.id = ${input.target.id} AND event.status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')
        ON CONFLICT (user_id, event_id) WHERE event_id IS NOT NULL
        DO UPDATE SET
          updates_enabled = COALESCE(${input.updatesEnabled ?? null}, content_subscriptions.updates_enabled),
          new_events_enabled = COALESCE(${input.newEventsEnabled ?? null}, content_subscriptions.new_events_enabled),
          new_venues_enabled = COALESCE(${input.newVenuesEnabled ?? null}, content_subscriptions.new_venues_enabled),
          event_changes_enabled = COALESCE(${input.eventChangesEnabled ?? null}, content_subscriptions.event_changes_enabled)
        RETURNING id
      `;
      if (!subscription) throw new NotFoundError("The event is not available to follow");
      return subscription.id;
    }

    const [existing] = await transaction<{ id: string }[]>`
      SELECT id FROM content_subscriptions
      WHERE user_id = ${userId} AND area_place_id = ${input.target.placeId}
    `;
    await assertCapacity(transaction, userId, input.scope, Boolean(existing));

    const [subscription] = await transaction<{ id: string }[]>`
      INSERT INTO content_subscriptions (
        user_id, area_place_id, area_label, area_country, area_geo, area_radius_meters,
        updates_enabled, new_events_enabled, new_venues_enabled, event_changes_enabled
      )
      VALUES (
        ${userId},
        ${input.target.placeId},
        ${input.target.label},
        ${input.target.country},
        ST_SetSRID(ST_MakePoint(${input.target.longitude}, ${input.target.latitude}), 4326)::geography,
        ${input.target.radiusMeters},
        ${preferences.updatesEnabled},
        ${preferences.newEventsEnabled},
        ${preferences.newVenuesEnabled},
        ${preferences.eventChangesEnabled}
      )
      ON CONFLICT (user_id, area_place_id) WHERE area_place_id IS NOT NULL
      DO UPDATE SET
        area_label = EXCLUDED.area_label,
        area_country = EXCLUDED.area_country,
        area_geo = EXCLUDED.area_geo,
        area_radius_meters = EXCLUDED.area_radius_meters,
        updates_enabled = COALESCE(${input.updatesEnabled ?? null}, content_subscriptions.updates_enabled),
        new_events_enabled = COALESCE(${input.newEventsEnabled ?? null}, content_subscriptions.new_events_enabled),
        new_venues_enabled = COALESCE(${input.newVenuesEnabled ?? null}, content_subscriptions.new_venues_enabled),
        event_changes_enabled = COALESCE(${input.eventChangesEnabled ?? null}, content_subscriptions.event_changes_enabled)
      RETURNING id
    `;
    return subscription.id;
  });
}

export async function updateContentSubscription(
  userId: string,
  subscriptionId: string,
  preferences: ContentSubscriptionPreferences,
) {
  const [subscription] = await sql<{ id: string }[]>`
    UPDATE content_subscriptions
    SET updates_enabled = ${preferences.updatesEnabled},
        new_events_enabled = ${preferences.newEventsEnabled},
        new_venues_enabled = ${preferences.newVenuesEnabled},
        event_changes_enabled = ${preferences.eventChangesEnabled}
    WHERE id = ${subscriptionId} AND user_id = ${userId}
    RETURNING id
  `;

  if (!subscription) throw new NotFoundError("The follow could not be found");
}

export async function removeContentSubscription(userId: string, subscriptionId: string) {
  const [subscription] = await sql<{ id: string }[]>`
    DELETE FROM content_subscriptions
    WHERE id = ${subscriptionId} AND user_id = ${userId}
    RETURNING id
  `;

  if (!subscription) throw new NotFoundError("The follow could not be found");
}

export async function getContentSubscriptionId(
  userId: string,
  scope: Extract<ContentSubscriptionScope, "event" | "venue">,
  targetId: string,
) {
  const targetColumn = scope === "venue" ? sql`venue_id` : sql`event_id`;
  const [subscription] = await sql<{ id: string }[]>`
    SELECT id
    FROM content_subscriptions
    WHERE user_id = ${userId} AND ${targetColumn} = ${targetId}
    LIMIT 1
  `;
  return subscription?.id ?? null;
}

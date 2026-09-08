import { z } from "zod";

import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import {
  createContentSubscription,
  getContentSubscriptionId,
  getContentSubscriptions,
  removeContentSubscription,
  updateContentSubscription,
} from "~/lib/models/content-subscriptions";

const preferencesSchema = z.object({
  eventChangesEnabled: z.boolean(),
  newEventsEnabled: z.boolean(),
  newVenuesEnabled: z.boolean(),
  updatesEnabled: z.boolean(),
});

const createSubscriptionSchema = z.discriminatedUnion("scope", [
  preferencesSchema.partial().extend({
    scope: z.literal("venue"),
    target: z.object({ id: z.string().uuid() }),
  }),
  preferencesSchema.partial().extend({
    scope: z.literal("event"),
    target: z.object({ id: z.string().uuid() }),
  }),
  preferencesSchema.partial().extend({
    scope: z.literal("area"),
    target: z.object({
      country: z.string().trim().min(2).max(120),
      label: z.string().trim().min(2).max(300),
      latitude: z.number().finite().min(-90).max(90),
      longitude: z.number().finite().min(-180).max(180),
      placeId: z.string().trim().min(1).max(255),
      radiusMeters: z.number().int().min(1000).max(100000),
    }),
  }),
]);

const updateSubscriptionSchema = z.object({
  id: z.string().uuid(),
  preferences: preferencesSchema,
});

const deleteSubscriptionSchema = z.object({ id: z.string().uuid() });
const privateNoStoreHeaders = { "Cache-Control": "private, no-store" };

export const dynamic = "force-dynamic";

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const params = new URL(req.url).searchParams;
    const targetId = params.get("targetId");
    const scope = params.get("scope");
    if (targetId || scope) {
      const parsed = z
        .object({ scope: z.enum(["event", "venue"]), targetId: z.string().uuid() })
        .safeParse({ scope, targetId });
      if (!parsed.success) throw new BadRequestError("Invalid follow target");
      return Response.json(
        {
          subscriptionId: await getContentSubscriptionId(session.user.id, parsed.data.scope, parsed.data.targetId),
        },
        { headers: privateNoStoreHeaders },
      );
    }
    return Response.json(
      { subscriptions: await getContentSubscriptions(session.user.id) },
      { headers: privateNoStoreHeaders },
    );
  });

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const input = await validateRequest(req, createSubscriptionSchema);
    const subscriptionId = await createContentSubscription(session.user.id, input);
    return Response.json({ subscriptionId }, { status: 201 });
  });

export const PATCH = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { id, preferences } = await validateRequest(req, updateSubscriptionSchema);
    await updateContentSubscription(session.user.id, id, preferences);
    return new Response(null, { status: 204 });
  });

export const DELETE = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { id } = await validateRequest(req, deleteSubscriptionSchema);
    await removeContentSubscription(session.user.id, id);
    return new Response(null, { status: 204 });
  });

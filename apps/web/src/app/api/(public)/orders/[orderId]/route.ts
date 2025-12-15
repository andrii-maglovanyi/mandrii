import { GET_ORDER_BY_ID } from "~/graphql/orders";
import { BadRequestError, getApiContext, NotFoundError, rateLimiters, withErrorHandling } from "~/lib/api";
import { getAdminClient } from "~/lib/graphql/adminClient";

interface OrderQueryResult {
  orders_by_pk: {
    created_at: string;
    currency: string;
    email: string;
    id: string;
    order_items: {
      currency: string;
      id: string;
      metadata: unknown;
      name_snapshot: string;
      product: {
        id: string;
        images: string[];
        name: string;
        slug: string;
      } | null;
      quantity: number;
      unit_price_minor: number;
    }[];
    payment_intent_id: string;
    status: string;
    subtotal_minor: number;
    total_minor: number;
  } | null;
}

interface OrderRouteContext {
  params: Promise<{ orderId: string }>;
}

/**
 * Validates if a string is a valid UUID v4
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * GET /api/orders/[orderId]
 *
 * Retrieves order details by ID.
 * Used by the order confirmation page to display order information.
 */
export const GET = (req: Request, context: OrderRouteContext) =>
  withErrorHandling(async () => {
    // Rate limit: 60 requests per minute per IP
    await rateLimiters.general.check();

    await getApiContext(req);
    const { orderId } = await context.params;

    // Validate UUID format before querying
    if (!isValidUUID(orderId)) {
      throw new BadRequestError("Invalid order ID format");
    }

    const client = getAdminClient();
    const { data } = await client.query<OrderQueryResult>({
      fetchPolicy: "network-only",
      query: GET_ORDER_BY_ID,
      variables: { id: orderId },
    });

    if (!data.orders_by_pk) {
      throw new NotFoundError("Order not found");
    }

    return Response.json({ order: data.orders_by_pk });
  });

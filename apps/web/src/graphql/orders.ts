import { gql } from "@apollo/client";

/**
 * Create a new order with order items.
 * Order is created first with payment_intent_id as null,
 * then updated after PaymentIntent creation succeeds.
 */
export const CREATE_ORDER = gql`
  mutation CreateOrder(
    $email: String!
    $user_id: uuid
    $subtotal_minor: Int!
    $total_minor: Int!
    $currency: String!
    $status: order_status_enum!
    $payment_intent_id: String
    $idempotency_key: String!
    $items: [order_items_insert_input!]!
  ) {
    insert_orders_one(
      object: {
        email: $email
        user_id: $user_id
        subtotal_minor: $subtotal_minor
        total_minor: $total_minor
        currency: $currency
        status: $status
        payment_intent_id: $payment_intent_id
        idempotency_key: $idempotency_key
        order_items: { data: $items }
      }
    ) {
      id
      email
      status
      total_minor
      currency
      created_at
      order_items {
        id
        name_snapshot
        quantity
        unit_price_minor
      }
    }
  }
`;

/**
 * Update order status (e.g., after payment confirmation).
 */
export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: uuid!, $status: order_status_enum!) {
    update_orders_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
      status
      updated_at
    }
  }
`;

/**
 * Get order by ID for confirmation page.
 */
export const GET_ORDER_BY_ID = gql`
  query GetOrderById($id: uuid!) {
    orders_by_pk(id: $id) {
      id
      email
      status
      subtotal_minor
      total_minor
      currency
      payment_intent_id
      created_at
      order_items {
        id
        name_snapshot
        quantity
        unit_price_minor
        currency
        metadata
        product {
          id
          name
          slug
          images
        }
      }
    }
  }
`;

/**
 * Decrement stock for a product variant.
 * Used atomically after successful payment.
 */
export const DECREMENT_VARIANT_STOCK = gql`
  mutation DecrementVariantStock($id: uuid!, $amount: Int!) {
    update_product_variants_by_pk(pk_columns: { id: $id }, _inc: { stock: $amount }) {
      id
      stock
    }
  }
`;

/**
 * Decrement stock for a product (non-variant products).
 */
export const DECREMENT_PRODUCT_STOCK = gql`
  mutation DecrementProductStock($id: uuid!, $amount: Int!) {
    update_products_by_pk(pk_columns: { id: $id }, _inc: { stock: $amount }) {
      id
      stock
    }
  }
`;

/**
 * Increment stock for a product variant (used for refunds).
 * Pass positive amount to restore stock.
 */
export const INCREMENT_VARIANT_STOCK = gql`
  mutation IncrementVariantStock($id: uuid!, $amount: Int!) {
    update_product_variants_by_pk(pk_columns: { id: $id }, _inc: { stock: $amount }) {
      id
      stock
    }
  }
`;

/**
 * Increment stock for a product (used for refunds).
 * Pass positive amount to restore stock.
 */
export const INCREMENT_PRODUCT_STOCK = gql`
  mutation IncrementProductStock($id: uuid!, $amount: Int!) {
    update_products_by_pk(pk_columns: { id: $id }, _inc: { stock: $amount }) {
      id
      stock
    }
  }
`;

/**
 * Delete an order by ID.
 * Used for cleanup when PaymentIntent creation fails after order was created.
 */
export const DELETE_ORDER = gql`
  mutation DeleteOrder($id: uuid!) {
    delete_orders_by_pk(id: $id) {
      id
    }
  }
`;

/**
 * Find existing order by idempotency key.
 * Used to ensure the same checkout request doesn't create duplicate orders.
 */
export const GET_ORDER_BY_IDEMPOTENCY_KEY = gql`
  query GetOrderByIdempotencyKey($idempotencyKey: String!) {
    orders(where: { idempotency_key: { _eq: $idempotencyKey } }, limit: 1) {
      id
      payment_intent_id
      status
    }
  }
`;

/**
 * Update order with payment_intent_id after PaymentIntent creation.
 */
export const UPDATE_ORDER_PAYMENT_INTENT = gql`
  mutation UpdateOrderPaymentIntent($id: uuid!, $payment_intent_id: String!) {
    update_orders_by_pk(pk_columns: { id: $id }, _set: { payment_intent_id: $payment_intent_id }) {
      id
      payment_intent_id
    }
  }
`;

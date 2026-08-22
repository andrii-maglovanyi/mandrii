import { gql } from "@apollo/client";

/**
 * A lightweight invalidation stream. Message bodies and reactions continue to
 * come from the protected REST endpoints, which keep pagination and response
 * shaping in one place.
 */
export const VENUE_MESSAGING_EVENTS_SUBSCRIPTION = gql`
  subscription VenueMessagingEvents($venueId: uuid!) {
    messages(
      limit: 1
      order_by: [{ created_at: desc }, { id: desc }]
      where: { conversation: { venue_id: { _eq: $venueId } } }
    ) {
      deleted_at
      id
      conversation_id
    }
  }
`;

/**
 * Watches updates to the messages presently rendered in the active chat. New
 * messages are detected by the lightweight venue stream above; this bounded
 * query avoids subscribing to a venue's complete message history.
 */
export const CONVERSATION_MESSAGING_EVENTS_SUBSCRIPTION = gql`
  subscription ConversationMessagingEvents($messageIds: [uuid!]!) {
    messages(order_by: [{ created_at: desc }, { id: desc }], where: { id: { _in: $messageIds } }) {
      deleted_at
      id
      conversation_id
    }
  }
`;

/**
 * Watch reactions for the messages currently loaded in the conversation. This
 * is intentionally bounded by the client page, rather than subscribing to a
 * venue's entire reaction history.
 */
export const CONVERSATION_REACTION_EVENTS_SUBSCRIPTION = gql`
  subscription ConversationReactionEvents($messageIds: [uuid!]!) {
    message_reactions(
      order_by: [{ message_id: asc }, { emoji: asc }, { user_id: asc }]
      where: { message_id: { _in: $messageIds } }
    ) {
      created_at
      emoji
      message_id
      user_id
    }
  }
`;

/**
 * The message toast only needs a signal to refresh its small unread summary.
 */
export const MESSAGING_UNREAD_EVENTS_SUBSCRIPTION = gql`
  subscription MessagingUnreadEvents {
    messages(limit: 1, order_by: [{ created_at: desc }, { id: desc }]) {
      id
    }
  }
`;

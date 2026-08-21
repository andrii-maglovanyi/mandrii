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
      id
      conversation_id
    }
  }
`;

/**
 * Reactions do not modify their parent message row. Watch the active page of
 * a conversation separately so both participants see a reaction immediately.
 */
export const CONVERSATION_MESSAGING_EVENTS_SUBSCRIPTION = gql`
  subscription ConversationMessagingEvents($conversationId: uuid!) {
    messages(
      limit: 50
      order_by: [{ created_at: desc }, { id: desc }]
      where: { conversation_id: { _eq: $conversationId } }
    ) {
      id
      conversation_id
      reactions(order_by: [{ created_at: desc }]) {
        created_at
        emoji
      }
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

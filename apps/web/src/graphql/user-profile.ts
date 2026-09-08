import { gql } from "@apollo/client";

/** Recent contributions shown on the signed-in user's profile. */
export const GET_OWN_USER_RECENT_CONTRIBUTIONS = gql`
  query GetOwnUserRecentContributions($id: uuid!) {
    venues(where: { user_id: { _eq: $id }, status: { _eq: ACTIVE } }, order_by: { created_at: desc }, limit: 5) {
      name
      slug
      city
      country
      created_at
      logo
      images
    }
    events(
      where: { user_id: { _eq: $id }, status: { _in: [ACTIVE, COMPLETED, CANCELLED, POSTPONED] } }
      order_by: { created_at: desc }
      limit: 5
    ) {
      title_en
      title_uk
      slug
      start_date
      end_date
      is_online
      is_recurring
      status
      city
      country
      created_at
      images
    }
  }
`;

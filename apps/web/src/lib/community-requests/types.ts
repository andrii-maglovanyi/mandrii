export const COMMUNITY_REQUEST_KINDS = ["REQUEST", "OFFER"] as const;
export type CommunityRequestKind = (typeof COMMUNITY_REQUEST_KINDS)[number];

export const COMMUNITY_REQUEST_CATEGORIES = [
  "PRACTICAL_SUPPORT",
  "FAMILY_AND_CHILDREN",
  "LANGUAGE_AND_TRANSLATION",
  "WORK_AND_SKILLS",
  "HOUSING_AND_ITEMS",
  "COMMUNITY_AND_VOLUNTEERING",
] as const;
export type CommunityRequestCategory = (typeof COMMUNITY_REQUEST_CATEGORIES)[number];

export type CommunityRequest = {
  author: { id: string; image: null | string; name: null | string };
  body: string;
  category: CommunityRequestCategory;
  country: string;
  createdAt: string;
  expiresAt: string;
  id: string;
  kind: CommunityRequestKind;
  location: null | string;
  relatedContent: CommunityRelatedContent | null;
  responseCount: number;
  status: "CLOSED" | "OPEN";
  title: string;
  viewerResponseId: null | string;
};

export type CommunityRelatedContent = {
  id: string;
  name: string;
  slug: string;
  type: "EVENT" | "VENUE";
};

export type CommunityRequestResponse = {
  author: { id: string; image: null | string; name: null | string };
  body: string;
  createdAt: string;
  id: string;
  messageCount: number;
};

export type CommunityResponseMessage = {
  body: string;
  createdAt: string;
  id: string;
  senderUserId: string;
  source: "TELEGRAM" | "WEB";
};

export type CommunityResponseThread = {
  messages: CommunityResponseMessage[];
  requestTitle: string;
  response: CommunityRequestResponse;
  viewerIsPostAuthor: boolean;
};

export type CommunityRequestFilters = {
  category?: CommunityRequestCategory;
  country?: string;
  kind?: CommunityRequestKind;
  location?: string;
  query?: string;
  relatedEventId?: string;
  relatedVenueId?: string;
  viewerUserId?: string;
};

export type CommunityRequestCursor = {
  createdAt: string;
  id: string;
  locationRank: 0 | 1;
};

export type CommunityRequestsPage = {
  nextCursor: null | string;
  requests: CommunityRequest[];
  total: number;
};

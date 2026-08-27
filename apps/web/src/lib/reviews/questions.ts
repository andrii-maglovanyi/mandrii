import { RatingTargetType } from "~/lib/ratings/types";

export type ReviewQuestion = { key: string; label: string };
export type ReviewQuestionSetVersion = 1 | 2;

export const CURRENT_REVIEW_QUESTION_SET: ReviewQuestionSetVersion = 2;

const venueQuestionsV1: ReviewQuestion[] = [
  { key: "accuracy", label: "Accuracy" },
  { key: "welcome", label: "Welcome" },
];
const eventQuestionsV1: ReviewQuestion[] = [
  { key: "organisation", label: "Organisation" },
  { key: "communication", label: "Communication" },
];
const venueQuestionByCategoryV1: Record<string, ReviewQuestion> = {
  ACCOMMODATION: { key: "comfort", label: "Comfort & cleanliness" },
  BEAUTY_SALON: { key: "service", label: "Service quality" },
  CAFE: { key: "food", label: "Food & drink" },
  CATERING: { key: "food", label: "Food & drink" },
  GROCERY_STORE: { key: "selection", label: "Selection" },
  LEGAL_SERVICE: { key: "service", label: "Service quality" },
  MEDICAL: { key: "care", label: "Care & professionalism" },
  RESTAURANT: { key: "food", label: "Food & drink" },
  SCHOOL: { key: "learning", label: "Learning experience" },
  SHOP: { key: "selection", label: "Selection" },
};
const eventQuestionByTypeV1: Record<string, ReviewQuestion> = {
  CHARITY: { key: "impact", label: "Community impact" },
  CONCERT: { key: "programme", label: "Programme" },
  CONFERENCE: { key: "content", label: "Content" },
  EXHIBITION: { key: "programme", label: "Programme" },
  FESTIVAL: { key: "programme", label: "Programme" },
  SCREENING: { key: "programme", label: "Programme" },
  SPORTS: { key: "experience", label: "Experience" },
  THEATER: { key: "programme", label: "Programme" },
  WORKSHOP: { key: "content", label: "Content" },
};

const venueQuestionsV2: Record<string, ReviewQuestion[]> = {
  ACCOMMODATION: [
    { key: "cleanliness", label: "Cleanliness" },
    { key: "as_described", label: "As described" },
    { key: "communication", label: "Communication" },
    { key: "location_access", label: "Location & access" },
    { key: "value", label: "Value" },
  ],
  BEAUTY_SALON: [
    { key: "result_quality", label: "Quality of result" },
    { key: "hygiene", label: "Hygiene & cleanliness" },
    { key: "punctuality", label: "Punctuality" },
  ],
  CAFE: [
    { key: "food_drink", label: "Food & drink" },
    { key: "atmosphere", label: "Atmosphere" },
    { key: "service", label: "Service" },
  ],
  CATERING: [
    { key: "food_quality", label: "Food quality" },
    { key: "presentation", label: "Presentation & setup" },
    { key: "reliability", label: "Reliability" },
  ],
  CHURCH: [
    { key: "worship", label: "Worship experience" },
    { key: "atmosphere", label: "Atmosphere" },
    { key: "community_welcome", label: "Community welcome" },
  ],
  CLUB: [
    { key: "programme", label: "Music & programme" },
    { key: "atmosphere", label: "Vibe & crowd" },
    { key: "service", label: "Service (bar & entry)" },
  ],
  CULTURAL_CENTRE: [
    { key: "programme", label: "Programme quality" },
    { key: "facilities", label: "Facilities & space" },
    { key: "atmosphere", label: "Atmosphere" },
  ],
  DELIVERY: [
    { key: "order_accuracy", label: "Order accuracy" },
    { key: "arrival_condition", label: "Condition on arrival" },
    { key: "reliability", label: "Speed & reliability" },
  ],
  GROCERY_STORE: [
    { key: "selection", label: "Selection & stock" },
    { key: "quality", label: "Freshness & quality" },
    { key: "cleanliness", label: "Store cleanliness" },
  ],
  LEGAL_SERVICE: [
    { key: "professionalism", label: "Professionalism" },
    { key: "clarity", label: "Clarity of advice" },
    { key: "responsiveness", label: "Responsiveness" },
  ],
  LIBRARY: [
    { key: "collection", label: "Collection & resources" },
    { key: "study_space", label: "Study space" },
    { key: "quietness", label: "Quietness" },
  ],
  MEDIA: [
    { key: "content_quality", label: "Content quality" },
    { key: "relevance", label: "Relevance & depth" },
    { key: "trust", label: "Accuracy & trust" },
  ],
  MEDICAL: [
    { key: "care", label: "Care & professionalism" },
    { key: "access", label: "Wait time & access" },
    { key: "communication", label: "Communication" },
  ],
  ORGANIZATION: [
    { key: "impact", label: "Purpose & impact" },
    { key: "transparency", label: "Transparency" },
    { key: "engagement", label: "Community engagement" },
  ],
  RESTAURANT: [
    { key: "food_drink", label: "Food & drink" },
    { key: "atmosphere", label: "Atmosphere" },
    { key: "service", label: "Service" },
    { key: "value", label: "Value" },
  ],
  SCHOOL: [
    { key: "learning", label: "Academic experience" },
    { key: "facilities", label: "Facilities" },
    { key: "care_support", label: "Care & support" },
    { key: "community", label: "Community culture" },
  ],
  SHOP: [
    { key: "selection", label: "Product selection" },
    { key: "quality", label: "Product quality" },
    { key: "service", label: "Customer service" },
  ],
  THEATRE: [
    { key: "programme", label: "Programme & curation" },
    { key: "acoustics", label: "View & acoustics" },
    { key: "comfort", label: "Facilities & comfort" },
  ],
};

const eventQuestionsV2: Record<string, ReviewQuestion[]> = {
  CELEBRATION: [
    { key: "food_drink", label: "Food & drink" },
    { key: "organisation", label: "Organisation & flow" },
    { key: "atmosphere", label: "Atmosphere" },
  ],
  CHARITY: [
    { key: "impact", label: "Cause & impact" },
    { key: "organisation", label: "Organisation & logistics" },
    { key: "engagement", label: "Community engagement" },
  ],
  CONCERT: [
    { key: "performance", label: "Performance quality" },
    { key: "sound", label: "Sound & acoustics" },
    { key: "venue", label: "Venue experience" },
  ],
  CONFERENCE: [
    { key: "content", label: "Content & speakers" },
    { key: "networking", label: "Networking" },
    { key: "organisation", label: "Organisation & logistics" },
  ],
  EXHIBITION: [
    { key: "curation", label: "Curation & displays" },
    { key: "layout", label: "Layout & flow" },
    { key: "context", label: "Information & context" },
  ],
  FESTIVAL: [
    { key: "programme", label: "Lineup & programme" },
    { key: "logistics", label: "Logistics & facilities" },
    { key: "atmosphere", label: "Atmosphere" },
  ],
  GATHERING: [
    { key: "connection", label: "Connection & networking" },
    { key: "organisation", label: "Organisation" },
    { key: "atmosphere", label: "Atmosphere" },
  ],
  OTHER: [
    { key: "programme", label: "Programme & activity" },
    { key: "organisation", label: "Organisation" },
    { key: "value", label: "Value" },
  ],
  SCREENING: [
    { key: "selection", label: "Content selection" },
    { key: "picture_sound", label: "Picture & sound quality" },
    { key: "comfort", label: "Comfort" },
  ],
  SPORTS: [
    { key: "action", label: "Action & event quality" },
    { key: "view", label: "View & seating" },
    { key: "facilities", label: "Facilities & logistics" },
  ],
  THEATER: [
    { key: "performance", label: "Performance quality" },
    { key: "production", label: "Production (sets & lighting)" },
    { key: "acoustics", label: "View & acoustics" },
  ],
  WORKSHOP: [
    { key: "content", label: "Learning content" },
    { key: "facilitation", label: "Facilitator & instructor" },
    { key: "structure", label: "Pace & structure" },
  ],
};

export const toReviewQuestionSetVersion = (value: number): ReviewQuestionSetVersion =>
  value === CURRENT_REVIEW_QUESTION_SET ? CURRENT_REVIEW_QUESTION_SET : 1;

export const getReviewQuestions = (
  type: RatingTargetType,
  context: string,
  version: ReviewQuestionSetVersion = CURRENT_REVIEW_QUESTION_SET,
): ReviewQuestion[] => {
  if (version === 1) {
    const questions = type === "venue" ? venueQuestionsV1 : eventQuestionsV1;
    const specificQuestion = type === "venue" ? venueQuestionByCategoryV1[context] : eventQuestionByTypeV1[context];
    return specificQuestion ? [...questions, specificQuestion] : questions;
  }
  return (type === "venue" ? venueQuestionsV2 : eventQuestionsV2)[context] ?? [];
};

export const hasValidReviewAspectRatings = (
  type: RatingTargetType,
  context: string,
  aspectRatings: Record<string, number>,
  version: ReviewQuestionSetVersion = CURRENT_REVIEW_QUESTION_SET,
) => {
  const questions = getReviewQuestions(type, context, version);
  const keys = Object.keys(aspectRatings).sort();
  const expectedKeys = questions.map((question) => question.key).sort();
  return (
    questions.length > 0 &&
    keys.length === expectedKeys.length &&
    keys.every((key, index) => key === expectedKeys[index]) &&
    Object.values(aspectRatings).every((rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5)
  );
};

/**
 * Clothing constants for the shop.
 *
 * These provide UI metadata (labels) for enum values stored in the database.
 * The enum values themselves come from Hasura enum tables and are generated
 * as TypeScript enums by GraphQL codegen:
 * - Clothing_Type_Enum
 * - Clothing_Gender_Enum
 * - Clothing_Age_Group_Enum
 * - Clothing_Size_Enum
 * - Product_Category_Enum
 *
 * Re-export the enum types for convenience.
 */
import {
  Clothing_Age_Group_Enum,
  Clothing_Gender_Enum,
  Clothing_Size_Enum,
  Clothing_Type_Enum,
  Product_Category_Enum,
} from "~/types/graphql.generated";

// Re-export enum types for convenience
export { Clothing_Age_Group_Enum, Clothing_Gender_Enum, Clothing_Size_Enum, Clothing_Type_Enum, Product_Category_Enum };

// =============================================================================
// Size Type Aliases (for backwards compatibility)
// =============================================================================

/** @deprecated Use Clothing_Size_Enum directly */
export type ClothingSize = Clothing_Size_Enum;
/** Adult sizes subset */
export type ClothingSizeAdult =
  | Clothing_Size_Enum.L
  | Clothing_Size_Enum.M
  | Clothing_Size_Enum.S
  | Clothing_Size_Enum.Xl
  | Clothing_Size_Enum.Xs
  | Clothing_Size_Enum.Xxl
  | Clothing_Size_Enum.Xxxl;
/** Kids sizes subset */
export type ClothingSizeKids =
  | Clothing_Size_Enum.Y11_12
  | Clothing_Size_Enum.Y13_14
  | Clothing_Size_Enum.Y3_4
  | Clothing_Size_Enum.Y5_6
  | Clothing_Size_Enum.Y7_8
  | Clothing_Size_Enum.Y9_10;

// =============================================================================
// UI Metadata Records
// =============================================================================

interface LabeledOption {
  label: { en: string; uk: string };
}

/**
 * Clothing types with localized labels.
 * Keys are the enum values from Clothing_Type_Enum.
 */
export const CLOTHING_TYPES: Record<Clothing_Type_Enum, LabeledOption> = {
  [Clothing_Type_Enum.Hoodie]: { label: { en: "Hoodie", uk: "Худі" } },
  [Clothing_Type_Enum.Jumper]: { label: { en: "Jumper", uk: "Джемпер" } },
  [Clothing_Type_Enum.Sweatshirt]: { label: { en: "Sweatshirt", uk: "Світшот" } },
  [Clothing_Type_Enum.Tshirt]: { label: { en: "T-Shirt", uk: "Футболка" } },
};

/**
 * All clothing genders with localized labels.
 * Keys are the enum values from Clothing_Gender_Enum.
 */
export const CLOTHING_GENDERS: Record<Clothing_Gender_Enum, LabeledOption> = {
  [Clothing_Gender_Enum.Boys]: { label: { en: "Boys", uk: "Хлопчики" } },
  [Clothing_Gender_Enum.Girls]: { label: { en: "Girls", uk: "Дівчатка" } },
  [Clothing_Gender_Enum.Men]: { label: { en: "Men", uk: "Чоловічий" } },
  [Clothing_Gender_Enum.Unisex]: { label: { en: "Unisex", uk: "Унісекс" } },
  [Clothing_Gender_Enum.Women]: { label: { en: "Women", uk: "Жіночий" } },
};

/**
 * Clothing age groups with localized labels.
 * Keys are the enum values from Clothing_Age_Group_Enum.
 */
export const CLOTHING_AGE_GROUPS: Record<Clothing_Age_Group_Enum, LabeledOption> = {
  [Clothing_Age_Group_Enum.Adult]: { label: { en: "Adult", uk: "Дорослий" } },
  [Clothing_Age_Group_Enum.Kids]: { label: { en: "Kids", uk: "Дитячий" } },
};

/**
 * All clothing sizes with localized labels.
 * Keys are the enum values from Clothing_Size_Enum.
 */
export const CLOTHING_SIZES: Record<Clothing_Size_Enum, { ageGroup: Clothing_Age_Group_Enum } & LabeledOption> = {
  [Clothing_Size_Enum.L]: { ageGroup: Clothing_Age_Group_Enum.Adult, label: { en: "L", uk: "L" } },
  [Clothing_Size_Enum.M]: { ageGroup: Clothing_Age_Group_Enum.Adult, label: { en: "M", uk: "M" } },
  [Clothing_Size_Enum.S]: { ageGroup: Clothing_Age_Group_Enum.Adult, label: { en: "S", uk: "S" } },
  [Clothing_Size_Enum.Xl]: { ageGroup: Clothing_Age_Group_Enum.Adult, label: { en: "XL", uk: "XL" } },
  // Adult sizes
  [Clothing_Size_Enum.Xs]: { ageGroup: Clothing_Age_Group_Enum.Adult, label: { en: "XS", uk: "XS" } },
  [Clothing_Size_Enum.Xxl]: { ageGroup: Clothing_Age_Group_Enum.Adult, label: { en: "2XL", uk: "2XL" } },
  [Clothing_Size_Enum.Xxxl]: { ageGroup: Clothing_Age_Group_Enum.Adult, label: { en: "3XL", uk: "3XL" } },
  [Clothing_Size_Enum.Y11_12]: {
    ageGroup: Clothing_Age_Group_Enum.Kids,
    label: { en: "11-12 years", uk: "11-12 років" },
  },
  [Clothing_Size_Enum.Y13_14]: {
    ageGroup: Clothing_Age_Group_Enum.Kids,
    label: { en: "13-14 years", uk: "13-14 років" },
  },
  // Kids sizes (sorted by age)
  [Clothing_Size_Enum.Y3_4]: {
    ageGroup: Clothing_Age_Group_Enum.Kids,
    label: { en: "3-4 years", uk: "3-4 роки" },
  },
  [Clothing_Size_Enum.Y5_6]: {
    ageGroup: Clothing_Age_Group_Enum.Kids,
    label: { en: "5-6 years", uk: "5-6 років" },
  },
  [Clothing_Size_Enum.Y7_8]: {
    ageGroup: Clothing_Age_Group_Enum.Kids,
    label: { en: "7-8 years", uk: "7-8 років" },
  },
  [Clothing_Size_Enum.Y9_10]: {
    ageGroup: Clothing_Age_Group_Enum.Kids,
    label: { en: "9-10 years", uk: "9-10 років" },
  },
};

// =============================================================================
// Helper Arrays (for UI iteration - sorted by display order)
// =============================================================================

/**
 * Adult genders for variant selection.
 */
export const ADULT_GENDERS: Clothing_Gender_Enum[] = [
  Clothing_Gender_Enum.Men,
  Clothing_Gender_Enum.Women,
  Clothing_Gender_Enum.Unisex,
];

/**
 * Kids genders for variant selection.
 */
export const KIDS_GENDERS: Clothing_Gender_Enum[] = [
  Clothing_Gender_Enum.Boys,
  Clothing_Gender_Enum.Girls,
  Clothing_Gender_Enum.Unisex,
];

/**
 * Adult sizes in display order.
 */
export const ADULT_SIZES: ClothingSizeAdult[] = [
  Clothing_Size_Enum.Xs,
  Clothing_Size_Enum.S,
  Clothing_Size_Enum.M,
  Clothing_Size_Enum.L,
  Clothing_Size_Enum.Xl,
  Clothing_Size_Enum.Xxl,
  Clothing_Size_Enum.Xxxl,
];

/**
 * Kids sizes in display order.
 */
export const KIDS_SIZES: ClothingSizeKids[] = [
  Clothing_Size_Enum.Y3_4,
  Clothing_Size_Enum.Y5_6,
  Clothing_Size_Enum.Y7_8,
  Clothing_Size_Enum.Y9_10,
  Clothing_Size_Enum.Y11_12,
  Clothing_Size_Enum.Y13_14,
];

/**
 * Age groups in display order.
 */
export const AGE_GROUPS: Clothing_Age_Group_Enum[] = [Clothing_Age_Group_Enum.Adult, Clothing_Age_Group_Enum.Kids];

/**
 * Clothing types in display order.
 */
export const CLOTHING_TYPE_LIST: Clothing_Type_Enum[] = [
  Clothing_Type_Enum.Tshirt,
  Clothing_Type_Enum.Sweatshirt,
  Clothing_Type_Enum.Jumper,
  Clothing_Type_Enum.Hoodie,
];

// =============================================================================
// Legacy exports (for backwards compatibility during migration)
// =============================================================================

/** @deprecated Use CLOTHING_AGE_GROUPS record instead */
export const CLOTHING_AGE_GROUP = AGE_GROUPS.map((value) => ({
  label: CLOTHING_AGE_GROUPS[value].label,
  value,
}));

/** @deprecated Use CLOTHING_GENDERS record with ADULT_GENDERS array */
export const CLOTHING_GENDER_ADULT = ADULT_GENDERS.map((value) => ({
  label: CLOTHING_GENDERS[value].label,
  value,
}));

/** @deprecated Use CLOTHING_GENDERS record with KIDS_GENDERS array */
export const CLOTHING_GENDER_KIDS = KIDS_GENDERS.map((value) => ({
  label: CLOTHING_GENDERS[value].label,
  value,
}));

/** @deprecated Use CLOTHING_GENDERS record instead */
export const CLOTHING_GENDER = (Object.keys(CLOTHING_GENDERS) as Clothing_Gender_Enum[]).map((value) => ({
  label: CLOTHING_GENDERS[value].label,
  value,
}));

/** @deprecated Use CLOTHING_SIZES record with ADULT_SIZES array */
export const CLOTHING_SIZE_ADULT = ADULT_SIZES.map((value) => ({
  label: CLOTHING_SIZES[value].label,
  value,
}));

/** @deprecated Use CLOTHING_SIZES record with KIDS_SIZES array */
export const CLOTHING_SIZE_KIDS = KIDS_SIZES.map((value) => ({
  label: CLOTHING_SIZES[value].label,
  value,
}));

/** @deprecated Use CLOTHING_TYPES record instead */
export const CLOTHING_TYPE = CLOTHING_TYPE_LIST.map((value) => ({
  label: CLOTHING_TYPES[value].label,
  value,
}));

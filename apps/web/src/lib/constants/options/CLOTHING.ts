/**
 * Clothing variant options for products like t-shirts, sweatshirts, jumpers, and hoodies.
 */

export const CLOTHING_TYPE = [
  { label: { en: "T-Shirt", uk: "Футболка" }, value: "tshirt" },
  { label: { en: "Sweatshirt", uk: "Світшот" }, value: "sweatshirt" },
  { label: { en: "Jumper", uk: "Джемпер" }, value: "jumper" },
  { label: { en: "Hoodie", uk: "Худі" }, value: "hoodie" },
] as const;

export const CLOTHING_GENDER = [
  { label: { en: "Men", uk: "Чоловічий" }, value: "men" },
  { label: { en: "Women", uk: "Жіночий" }, value: "women" },
  { label: { en: "Unisex", uk: "Унісекс" }, value: "unisex" },
] as const;

export const CLOTHING_AGE_GROUP = [
  { label: { en: "Adult", uk: "Дорослий" }, value: "adult" },
  { label: { en: "Kids", uk: "Дитячий" }, value: "kids" },
] as const;

export const CLOTHING_SIZE_ADULT = [
  { label: { en: "XS", uk: "XS" }, value: "xs" },
  { label: { en: "S", uk: "S" }, value: "s" },
  { label: { en: "M", uk: "M" }, value: "m" },
  { label: { en: "L", uk: "L" }, value: "l" },
  { label: { en: "XL", uk: "XL" }, value: "xl" },
  { label: { en: "2XL", uk: "2XL" }, value: "2xl" },
  { label: { en: "3XL", uk: "3XL" }, value: "3xl" },
] as const;

export const CLOTHING_SIZE_KIDS = [
  { label: { en: "3-4 years", uk: "3-4 роки" }, value: "3-4y" },
  { label: { en: "5-6 years", uk: "5-6 років" }, value: "5-6y" },
  { label: { en: "7-8 years", uk: "7-8 років" }, value: "7-8y" },
  { label: { en: "9-10 years", uk: "9-10 років" }, value: "9-10y" },
  { label: { en: "11-12 years", uk: "11-12 років" }, value: "11-12y" },
  { label: { en: "13-14 years", uk: "13-14 років" }, value: "13-14y" },
] as const;

export type ClothingAgeGroup = (typeof CLOTHING_AGE_GROUP)[number]["value"];
export type ClothingGender = (typeof CLOTHING_GENDER)[number]["value"];
export type ClothingSize = ClothingSizeAdult | ClothingSizeKids;
export type ClothingSizeAdult = (typeof CLOTHING_SIZE_ADULT)[number]["value"];
export type ClothingSizeKids = (typeof CLOTHING_SIZE_KIDS)[number]["value"];
export type ClothingType = (typeof CLOTHING_TYPE)[number]["value"];

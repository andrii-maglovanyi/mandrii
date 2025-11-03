export type AddressType = "fuzzy" | "invalid" | "specific";

export const detectAddressType = (address: string): AddressType => {
  const trimmed = address.trim();

  if (trimmed.length < 3) return "invalid";

  const words = trimmed.split(/\s+/);
  const hasDigit = /\d/.test(trimmed); // numbers usually mean building number or postal code
  const commaCount = (trimmed.match(/,/g) || []).length;
  const hasSeparator = /[-/\\]/.test(trimmed); // e.g. "12-14 Baker St"
  const wordCount = words.length;

  // Check if it's CJK (Chinese/Japanese/Korean) text
  const isCJK = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(trimmed);

  // Single word or just digits without context → fuzzy
  if (wordCount < 2 && !hasDigit && !isCJK) return "fuzzy";
  if (wordCount === 1 && hasDigit && !isCJK) return "fuzzy"; // Just "123" is fuzzy

  // CJK addresses with digits are specific (e.g., Japanese addresses)
  if (isCJK && hasDigit) return "specific";

  // Multiple commas without digits typically means nested regions (fuzzy)
  if (commaCount >= 2 && !hasDigit) return "fuzzy";

  // Heuristic: count structure complexity
  const complexityScore =
    (hasDigit && wordCount >= 2 ? 2 : 0) + // digits WITH context are strong signal
    (hasSeparator ? 1 : 0) + // separators slightly increase specificity
    (commaCount >= 2 && hasDigit ? 1 : 0) + // multiple commas WITH digits = structured address
    (wordCount >= 4 ? 1 : 0); // descriptive phrases (4+ words) are more likely specific locations

  // Threshold logic
  if (complexityScore >= 2) return "specific";

  // Fallback: likely just a city/area/country
  return "fuzzy";
};

export const isPotentiallyValidAddress = (address: string): boolean => {
  return detectAddressType(address) !== "invalid";
};

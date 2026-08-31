const contactDetailsPattern = /(?:\b[\w.+-]+@[\w-]+\.[\w.-]+\b|https?:\/\/|www\.|(?:\+?\d[\d ()-]{7,}\d))/i;

/** Community posts stay public, so direct contact details are intentionally not allowed. */
export const hasCommunityRequestContactDetails = (value: string) => contactDetailsPattern.test(value);

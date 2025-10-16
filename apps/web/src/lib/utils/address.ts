export const isPotentiallyValidAddress = (address: string): boolean => {
  const trimmed = address.trim();

  // Require at least 2 words
  if (trimmed.split(/\s+/).length < 2) return false;

  // Require at least 10 characters
  if (trimmed.length < 10) return false;

  // Require either a digit (house/building number) or a comma
  if (!/\d/.test(trimmed) && !trimmed.includes(",")) return false;

  return true;
};

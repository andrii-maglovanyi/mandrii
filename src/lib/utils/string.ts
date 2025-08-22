export const toSnakeCase = (text: string) => {
  text = text.trim().toLowerCase();

  // Replace non-letter, non-digit characters with underscores
  // \p{L} matches any Unicode letter (including Cyrillic)
  // \p{N} matches any Unicode number
  let snakeCase = text.replace(/[^\p{L}\p{N}]+/gu, "_");

  // Remove leading and trailing underscores
  snakeCase = snakeCase.replace(/^_+|_+$/g, "");

  return snakeCase;
};

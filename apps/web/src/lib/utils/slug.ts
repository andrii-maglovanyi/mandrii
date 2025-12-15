import slugify from "slugify";

export function constructSlug(...parts: (null | string | undefined)[]): string {
  const combined = parts.filter(Boolean).join(" ");

  // Generate base slug
  let slug = slugify(combined, {
    lower: true,
    strict: true,
  });

  // If slug is less than 10 characters, add random alphanumeric suffix
  if (slug.length < 10) {
    const charsNeeded = 10 - slug.length - 1; // -1 for the dash
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 2 + charsNeeded)
      .padEnd(charsNeeded, "0");
    slug = `${slug}-${randomSuffix}`;
  }

  return slug;
}

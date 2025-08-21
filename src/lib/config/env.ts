export const isProduction = process.env.NODE_ENV === "production";
export const isPreview = process.env.VERCEL_ENV === "preview";
export const isDevelopment = process.env.NODE_ENV === "development";
export const isTest = process.env.NODE_ENV === "test";

export const envName = (() => {
  if (isTest) return "test";
  if (isPreview) return "preview";
  if (isProduction) return "production";
  return "development";
})();

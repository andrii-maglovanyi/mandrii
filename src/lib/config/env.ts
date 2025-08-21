export const isProduction = process.env.NODE_ENV === "production";
export const isPreview = process.env.VERCEL_ENV === "preview";
export const isDevelopment = process.env.NODE_ENV === "development";

export const IMAGE_UPLOAD_SOURCE_TYPES = [
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

/** Formats accepted after browser preparation and by server-side image processing. */
export const IMAGE_UPLOAD_PROCESSED_TYPES = ["image/avif", "image/jpeg", "image/png", "image/webp"] as const;

export const IMAGE_UPLOAD_ACCEPT = IMAGE_UPLOAD_SOURCE_TYPES.join(",");
export const IMAGE_UPLOAD_MAX_SOURCE_BYTES = 15 * 1024 * 1024;

/** Per-flow budgets keep each multipart request within Vercel Hobby's body limit. */
export const IMAGE_UPLOAD_PROFILES = {
  event: {
    maxBytes: Math.floor(1.1 * 1024 * 1024),
    maxImages: 3,
  },
  profile: {
    maxBytes: 500 * 1024,
    maxImages: 1,
  },
  update: {
    maxBytes: Math.floor(1.2 * 1024 * 1024),
    maxImages: 3,
    maxTotalBytes: Math.floor(3.6 * 1024 * 1024),
  },
  venue: {
    maxBytes: 500 * 1024,
    maxImages: 6,
  },
} as const;

export const isSupportedImageUploadSource = (image: Pick<File, "size" | "type">) =>
  IMAGE_UPLOAD_SOURCE_TYPES.includes(image.type as (typeof IMAGE_UPLOAD_SOURCE_TYPES)[number]) &&
  image.size > 0 &&
  image.size <= IMAGE_UPLOAD_MAX_SOURCE_BYTES;

export const isProcessedImageUpload = (image: Pick<File, "size" | "type">, maxBytes: number) =>
  IMAGE_UPLOAD_PROCESSED_TYPES.includes(image.type as (typeof IMAGE_UPLOAD_PROCESSED_TYPES)[number]) &&
  image.size > 0 &&
  image.size <= maxBytes;

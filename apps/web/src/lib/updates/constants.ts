import { IMAGE_UPLOAD_PROFILES } from "~/lib/images/uploadConfig";

export const CONTENT_UPDATE_MAX_IMAGES = IMAGE_UPLOAD_PROFILES.update.maxImages;
// Vercel Hobby rejects oversized request bodies before a route can process
// them. Keep all compressed images comfortably below that boundary.
export const CONTENT_UPDATE_MAX_IMAGE_BYTES = IMAGE_UPLOAD_PROFILES.update.maxBytes;
export const CONTENT_UPDATE_MAX_TOTAL_IMAGE_BYTES = IMAGE_UPLOAD_PROFILES.update.maxTotalBytes;
export const CONTENT_UPDATE_IMAGE_TYPES = ["image/avif", "image/jpeg", "image/png", "image/webp"] as const;
export const CONTENT_UPDATE_PAGE_SIZE = 10;
export const CONTENT_UPDATE_MAX_PAGE_SIZE = 20;

export const isContentUpdateImage = (image: Pick<File, "size" | "type">) =>
  CONTENT_UPDATE_IMAGE_TYPES.includes(image.type as (typeof CONTENT_UPDATE_IMAGE_TYPES)[number]) &&
  image.size > 0 &&
  image.size <= CONTENT_UPDATE_MAX_IMAGE_BYTES;

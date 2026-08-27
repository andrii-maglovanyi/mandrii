export const CONTENT_UPDATE_MAX_IMAGES = 3;
export const CONTENT_UPDATE_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const CONTENT_UPDATE_IMAGE_TYPES = ["image/avif", "image/jpeg", "image/png", "image/webp"] as const;
export const CONTENT_UPDATE_IMAGE_ACCEPT = CONTENT_UPDATE_IMAGE_TYPES.join(",");
export const CONTENT_UPDATE_PAGE_SIZE = 10;
export const CONTENT_UPDATE_MAX_PAGE_SIZE = 20;

export const isContentUpdateImage = (image: Pick<File, "size" | "type">) =>
  CONTENT_UPDATE_IMAGE_TYPES.includes(image.type as (typeof CONTENT_UPDATE_IMAGE_TYPES)[number]) &&
  image.size > 0 &&
  image.size <= CONTENT_UPDATE_MAX_IMAGE_BYTES;

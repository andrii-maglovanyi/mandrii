import { del, list, put } from "@vercel/blob";
import sharp from "sharp";

export const processAndUploadImage = async (file: Buffer, fileName: string) => {
  const processedImageBuffer = await sharp(file)
    .rotate() // fix EXIF rotation
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ effort: 6, quality: 75 })
    .toBuffer();

  const blob = await put(`${fileName}.webp`, processedImageBuffer, {
    access: "public",
    addRandomSuffix: true,
  });

  return new URL(blob.url).pathname.replace(/^\/+/, "");
};

export const processImages = async (images: File[], prefix: string) => {
  const imageUrls: string[] = [];
  const fileNames = new Set(images.map((image) => image.name));

  const blobNames: string[] = [];
  const blobsToDelete: string[] = [];

  const { blobs } = await list({ prefix });

  for (const blob of blobs) {
    const blobName = blob.pathname.split("/").pop();
    if (blobName) {
      blobNames.push(blobName);

      if (!fileNames.has(blobName)) {
        blobsToDelete.push([prefix, blobName].join("/"));
      }
    }
  }

  if (blobsToDelete.length) {
    await del(blobsToDelete);
  }

  const errors: Array<{ error: Error; file: string }> = [];

  for (const image of images) {
    if (!image.name || !image.type.startsWith("image/")) {
      continue;
    }

    if (blobNames.includes(image.name)) {
      imageUrls.push([prefix, image.name].join("/"));
      continue;
    }

    try {
      const buffer = Buffer.from(await image.arrayBuffer());
      const uploadedUrl = await processAndUploadImage(buffer, [prefix, "img"].join("/"));
      imageUrls.push(uploadedUrl);
    } catch (error) {
      // Collect errors but continue processing other images
      console.error(`Failed to process image ${image.name}:`, error);
      errors.push({
        error: error instanceof Error ? error : new Error(String(error)),
        file: image.name,
      });
    }
  }

  // If ALL images failed, throw an error
  if (errors.length > 0 && imageUrls.length === 0) {
    const errorMessages = errors.map((e) => `${e.file}: ${e.error.message}`).join("; ");
    throw new Error(`All image uploads failed: ${errorMessages}`);
  }

  // If SOME images failed, log but continue (partial success)
  if (errors.length > 0) {
    console.warn(`${errors.length} of ${images.length} images failed to upload`);
  }

  return imageUrls;
};

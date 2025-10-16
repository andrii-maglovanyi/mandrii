import { del, list, put } from "@vercel/blob";
import sharp from "sharp";

export const processAndUploadImage = async (file: Buffer, fileName: string) => {
  try {
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
  } catch (error) {
    console.error("Image processing error:", error);
    return null;
  }
};

export const processImages = async (images: File[], prefix: string) => {
  try {
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

    for (const image of images) {
      if (!image.name || !image.type.startsWith("image/")) {
        continue;
      }

      if (blobNames.includes(image.name)) {
        imageUrls.push([prefix, image.name].join("/"));
        continue;
      }

      const buffer = Buffer.from(await image.arrayBuffer());

      const uploadedUrl = await processAndUploadImage(buffer, [prefix, "img"].join("/"));

      if (uploadedUrl) {
        imageUrls.push(uploadedUrl);
      }
    }

    return imageUrls;
  } catch (error) {
    console.error("Error processing images:", error);
    throw error;
  }
};

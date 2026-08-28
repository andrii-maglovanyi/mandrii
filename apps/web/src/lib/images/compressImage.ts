const MAX_DIMENSION = 1600;
const QUALITY_STEPS = [0.82, 0.7, 0.58] as const;
const SCALE_STEPS = [1, 0.8, 0.65] as const;

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Unable to compress image"))),
      "image/webp",
      quality,
    );
  });

const loadImage = async (file: File) => {
  const image = document.createElement("img");
  const url = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to read image"));
      image.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
};

const outputName = (name: string, type: string) => {
  const extension = type === "image/png" ? "png" : type === "image/jpeg" ? "jpg" : "webp";
  return `${name.replace(/\.[^.]+$/, "") || "photo"}.${extension}`;
};

/** Prepares a photo before it reaches Vercel's serverless request boundary. */
export const compressImageForUpload = async (file: File, maxBytes: number): Promise<File> => {
  const needsFormatConversion = file.type === "image/heic" || file.type === "image/heif";
  if (file.size <= maxBytes && !needsFormatConversion) return file;

  const image = await loadImage(file);
  const baseScale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));

  for (const scaleStep of SCALE_STEPS) {
    const width = Math.max(1, Math.round(image.naturalWidth * baseScale * scaleStep));
    const height = Math.max(1, Math.round(image.naturalHeight * baseScale * scaleStep));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to prepare image");
    context.drawImage(image, 0, 0, width, height);

    for (const quality of QUALITY_STEPS) {
      const blob = await canvasToBlob(canvas, quality);
      if (blob.size <= maxBytes) {
        return new File([blob], outputName(file.name, blob.type), { lastModified: file.lastModified, type: blob.type });
      }
    }
  }

  throw new Error("Unable to compress image enough for upload");
};

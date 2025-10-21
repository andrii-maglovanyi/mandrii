import { constants } from "~/lib/constants";
import { UrlHelper } from "~/lib/url-helper";

interface FileOptions {
  name?: string;
  type?: string;
}

/**
 * Convert a URL (absolute or relative) to a File object.
 * Useful for re-uploading existing images stored in Vercel Blob Storage.
 *
 * @param url - Absolute URL or relative path
 * @param options - Optional file name and type
 * @returns File object
 */
export async function createFileFromUrl(url: string, options: FileOptions = {}): Promise<File> {
  const fullUrl = UrlHelper.isAbsoluteUrl(url) ? url : `${constants.vercelBlobStorageUrl}/${url}`;

  const response = await fetch(fullUrl);
  const blob = await response.blob();

  const file = new File([blob], options.name || "file", {
    type: options.type || blob.type,
  });

  return file;
}

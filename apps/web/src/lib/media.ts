import { constants } from "~/lib/constants";
import { UrlHelper } from "~/lib/url-helper";

export const getPublicMediaUrl = (path: null | string | undefined) => {
  if (!path) return null;
  if (UrlHelper.isAbsoluteUrl(path)) return path;

  return `${constants.vercelBlobStorageUrl}/${path.replace(/^\/+/, "")}`;
};

import { copyToClipboard } from "./clipboard";
import { sendToMixpanel } from "./mixpanel";

interface ShareItemParams {
  cb?: () => void;
  item: {
    text: string;
    title: string;
    url: string;
  };
}

export const shareItem = async (e: React.MouseEvent, params: ShareItemParams) => {
  e.preventDefault();
  e.stopPropagation();

  const { cb, item } = params;

  sendToMixpanel("Clicked Share", { item: params.item });

  if (navigator.share) {
    try {
      await navigator.share(item);
      return;
    } catch (err) {
      console.error("Error sharing:", err);
    }
  }

  try {
    await copyToClipboard(item.url);
    cb?.();
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
  }
};

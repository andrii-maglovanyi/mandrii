export const OFFLINE_ARTICLES_KEY = "mandrii-offline-articles-v1";
export type OfflineArticle = { savedAt: string; text: string; title: string; url: string; };

/** Explicit, text-only copies of public posts. Never store account pages or HTML. */
export function saveOfflineArticle(article: OfflineArticle, storage: Storage = localStorage) {
  if (!/^\/(en|uk)\/posts\/[^/?#]+\/[^/?#]+$/.test(article.url)) throw new Error("Only public articles can be saved");
  if (!article.text.trim() || article.text.length > 100_000) throw new Error("Article cannot be saved");
  let previous: OfflineArticle[] = [];
  try {
    const value: unknown = JSON.parse(storage.getItem(OFFLINE_ARTICLES_KEY) ?? "[]");
    if (Array.isArray(value))
      previous = value.filter((item): item is OfflineArticle =>
        Boolean(
          item && typeof item.url === "string" && typeof item.text === "string" && typeof item.title === "string",
        ),
      );
  } catch {
    /* Recover from malformed local data. */
  }
  const next = [article, ...previous.filter((item) => item.url !== article.url)].slice(0, 20);
  while (JSON.stringify(next).length > 500_000 && next.length > 1) next.pop();
  storage.setItem(OFFLINE_ARTICLES_KEY, JSON.stringify(next));
}

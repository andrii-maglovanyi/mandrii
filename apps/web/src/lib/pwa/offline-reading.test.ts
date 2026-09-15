import { beforeEach, expect, it } from "vitest";

import { OFFLINE_ARTICLES_KEY, saveOfflineArticle } from "./offline-reading";

beforeEach(() => localStorage.clear());
const article = {
  savedAt: "2026-09-15",
  text: "Public article text",
  title: "Article",
  url: "/en/posts/travel/london",
};
it("updates a saved public article without duplicating it", () => {
  saveOfflineArticle(article);
  saveOfflineArticle({ ...article, text: "Updated" });
  expect(JSON.parse(localStorage.getItem(OFFLINE_ARTICLES_KEY)!)).toEqual([{ ...article, text: "Updated" }]);
});
it.each(["/en/settings", "/en/posts", "/en/messages/private", "https://external.test/en/posts/a/b"])(
  "rejects saving %s",
  (url) => {
    expect(() => saveOfflineArticle({ ...article, url })).toThrow();
    expect(localStorage.getItem(OFFLINE_ARTICLES_KEY)).toBeNull();
  },
);
it("bounds storage and recovers from malformed data", () => {
  localStorage.setItem(OFFLINE_ARTICLES_KEY, "malformed");
  for (let index = 0; index < 25; index++) saveOfflineArticle({ ...article, url: `/uk/posts/travel/${index}` });
  expect(JSON.parse(localStorage.getItem(OFFLINE_ARTICLES_KEY)!)).toHaveLength(20);
});

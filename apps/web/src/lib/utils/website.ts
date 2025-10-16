export const isWebsite = (url: string, { allowLocal = false } = {}) => {
  if (!url) return false;

  let testUrl = url.trim();
  if (!/^https?:\/\//i.test(testUrl)) {
    testUrl = "https://" + testUrl;
  }

  try {
    const parsed = new URL(testUrl);

    if (allowLocal && ["127.0.0.1", "localhost"].includes(parsed.hostname)) {
      return true;
    }

    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(parsed.hostname);
  } catch {
    return false;
  }
};

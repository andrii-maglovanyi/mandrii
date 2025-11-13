import punycode from "punycode/";

export function formatDisplayUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    const decodedHostname = urlObj.hostname.startsWith("xn--") ? punycode.toUnicode(urlObj.hostname) : urlObj.hostname;

    const path = urlObj.pathname === "/" ? "" : urlObj.pathname;
    const search = urlObj.search;
    const hash = urlObj.hash;

    return decodedHostname + path + search + hash;
  } catch {
    return url;
  }
}

export function normalizeUrl(input: string): { display: string; href: string } {
  try {
    const urlString = input.startsWith("http") ? input : `https://${input}`;
    const url = new URL(urlString);

    return {
      display: formatDisplayUrl(url.href),
      href: url.href,
    };
  } catch {
    return { display: input, href: input };
  }
}

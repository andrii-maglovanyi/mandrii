export function getPlatform(): string {
  if (typeof navigator === "undefined") return "Unknown";

  const nav = navigator as {
    userAgentData?: {
      platform?: string;
    };
  } & Navigator;

  if (nav.userAgentData?.platform) {
    return nav.userAgentData.platform;
  }

  if (!navigator.userAgent) return "Unknown";

  const ua = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) return "iOS";
  if (ua.includes("android")) return "Android";
  if (ua.includes("cros")) return "Chrome OS";
  if (ua.includes("win")) return "Windows";
  if (ua.includes("mac")) return "macOS";
  if (ua.includes("freebsd")) return "FreeBSD";
  if (ua.includes("linux")) return "Linux";

  return "Unknown";
}

import { isPreview } from "./config/env";
import { UrlHelper } from "./url-helper";

export async function validateCaptcha(token: string, action: string): Promise<boolean> {
  const res = await fetch(`${UrlHelper.buildApiUrl("captcha")}`, {
    body: JSON.stringify({ action, token }),
    headers: {
      "Content-Type": "application/json",
      ...(isPreview && process.env.VERCEL_AUTOMATION_BYPASS_SECRET
        ? { "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
        : {}),
    },
    method: "POST",
  });

  console.log("DEBUG data:", JSON.stringify({ action, token }));
  console.log("DEBUG request URL:", `${UrlHelper.buildApiUrl("captcha")}`);
  console.log("DEBUG response status:", res.status);
  console.log("DEBUG response headers:", JSON.stringify(res.headers));

  if (!res.ok) {
    return false;
  }

  const data = await res.json();

  return data.success === true;
}

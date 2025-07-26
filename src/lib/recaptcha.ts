import { privateConfig } from "./config/private";
import { UrlHelper } from "./url-helper";

export async function validateCaptcha(
  token: string,
  action: string,
): Promise<boolean> {
  const res = await fetch(`${UrlHelper.buildApiUrl("captcha")}`, {
    body: JSON.stringify({ action, token }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!res.ok) {
    return false;
  }

  const data = await res.json();

  return data.success === true;
}

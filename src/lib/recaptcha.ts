import { privateConfig } from "./config/private";

export async function validateCaptcha(
  token: string,
  expectedAction: string,
): Promise<boolean> {
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    body: `secret=${privateConfig.recaptcha.secretKey}&response=${token}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  const data = await res.json();
  return data.success && data.score > 0.5 && data.action === expectedAction;
}

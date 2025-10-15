import { validateCaptcha } from "../recaptcha";
import { BadRequestError } from "./errors";

export async function verifyCaptcha(token: string, action: string) {
  if (!token) {
    throw new BadRequestError("Captcha token required");
  }

  const isHuman = await validateCaptcha(token, action);

  if (!isHuman) {
    throw new BadRequestError("Invalid captcha");
  }

  return true;
}

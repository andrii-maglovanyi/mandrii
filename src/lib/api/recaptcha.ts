import { validateCaptcha } from "../recaptcha";

export async function verifyCaptcha(token: string, action: string) {
  const isHuman = await validateCaptcha(token, action);

  if (!isHuman) {
    return Response.json(
      { error: "reCAPTCHA verification failed" },
      { status: 403 },
    );
  }
}

import { validateCaptcha } from "~/lib/recaptcha";

export async function verifyCaptcha(token: string, action: string) {
  const valid = await validateCaptcha(token, action);
  if (!valid) {
    return Response.json(
      { error: "reCAPTCHA verification failed" },
      { status: 403 },
    );
  }
}

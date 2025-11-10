import { captureException } from "@sentry/nextjs";

const verifyCaptcha = async (token: string, action: string) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    throw new Error("RECAPTCHA_SECRET_KEY is not set");
  }

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    body: `secret=${secret}&response=${token}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`reCAPTCHA API returned HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  return data.success && data.score > 0.5 && data.action === action;
};

export async function POST(request: Request) {
  try {
    const { action, token } = await request.json();

    if (!token || typeof token !== "string") {
      return Response.json({ error: "Invalid or missing reCAPTCHA token" }, { status: 400 });
    }

    if (!action || typeof action !== "string") {
      return Response.json({ error: "Invalid or missing action" }, { status: 400 });
    }

    const success = await verifyCaptcha(token, action);

    if (!success) {
      return Response.json({ error: "reCAPTCHA verification failed" }, { status: 403 });
    }

    return Response.json({ success }, { status: 200 });
  } catch (error) {
    console.error("Error in reCAPTCHA route:", error);
    captureException(error, {
      extra: {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        hasAction: !!request,
      },
      tags: { api_route: "captcha" },
    });

    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}

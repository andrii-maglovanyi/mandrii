import { render } from "@react-email/render";

import { getI18n } from "~/i18n/getI18n";

import SignInEmail from "../components/email/SignInEmail";
import { constants } from "./constants";
import { validateCaptcha } from "./recaptcha";

type EmailPrams = {
  i18n: (key: string, params?: Record<string, string>) => string;
  url: string;
};

type SendVerificationRequestParams = {
  identifier: string;
  provider: {
    apiKey?: string;
    from?: string;
  };
  request: Request;
  url: string;
};

export async function sendVerificationRequest(
  params: SendVerificationRequestParams,
) {
  const { identifier: to, provider, url } = params;

  const { searchParams } = new URL(params.request.url);
  const locale = searchParams.get("locale") ?? "en";
  const token = searchParams.get("token");
  const i18n = await getI18n({ locale });
  const emailParams = { i18n, url };

  const isHuman = token && (await validateCaptcha(token, "signin_form"));
  if (!isHuman) {
    throw new Error("reCAPTCHA verification failed");
  }

  const res = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: constants.fromEmail(locale),
      html: await html(emailParams),
      subject: i18n("Sign in to Mandrii"),
      text: text(emailParams),
      to,
    }),
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!res.ok)
    throw new Error("Resend error: " + JSON.stringify(await res.json()));
}

async function html({ i18n, url }: EmailPrams) {
  return render(<SignInEmail i18n={i18n} url={url} />);
}

function text({ i18n, url }: EmailPrams) {
  return `${i18n("Sign in to Mandrii")}\n${url}\n\n`;
}

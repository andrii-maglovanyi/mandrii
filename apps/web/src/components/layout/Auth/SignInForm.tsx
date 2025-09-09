"use client";

import { signIn } from "next-auth/react";
import { useLocale } from "next-intl";
import { FormEvent, useEffect, useRef, useState } from "react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

import { Button, Input, Separator, SvgIcon } from "~/components/ui";
import { useForm } from "~/hooks/useForm";
import { useI18n } from "~/i18n/useI18n";
import { publicConfig } from "~/lib/config/public";
import { sendToMixpanel } from "~/lib/mixpanel";
import { getEmailFormSchema } from "~/lib/validation/email";

const SignIn = () => {
  const [isBusy, setIsBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const locale = useLocale();
  const i18n = useI18n();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const { getFieldProps, isFormValid, validateForm, values } = useForm({
    schema: getEmailFormSchema(i18n),
  });

  useEffect(() => {
    sendToMixpanel("Opened Sign In Dialog");
    inputRef.current?.focus();
  }, []);

  const handleEmailAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!executeRecaptcha) {
      return;
    }

    setIsBusy(true);
    const token = await executeRecaptcha("signin_form");

    sendToMixpanel("Signed In", { method: "email" });

    await signIn("resend", values, { locale, token });
  };

  const { error, onChange, value } = getFieldProps("email");

  return (
    <>
      <h2 className="mb-4 text-center text-xl font-semibold text-on-surface">
        {i18n("You can do so much more if you have a profile")}
      </h2>
      <p className="mb-6 text-center">{i18n("You can add new locations and so much more to come")}</p>
      <form onSubmit={handleEmailAuth}>
        <div className="mx-auto max-w-md space-y-4">
          <Input
            disabled={isBusy}
            error={error}
            id="email"
            label={i18n("Email address")}
            name="email"
            onChange={onChange}
            placeholder="you@example.com"
            ref={inputRef}
            required
            type="email"
            value={value}
          />

          <Button
            busy={isBusy}
            className="w-full"
            color="primary"
            disabled={!isFormValid}
            type="submit"
            variant="filled"
          >
            {i18n("Sign in with email")}
          </Button>
        </div>
      </form>
      <div className="mx-auto max-w-md space-y-4">
        <Separator className="my-6" text={i18n("or")} variant="margin" />
        <Button
          className="flex w-full items-center justify-center gap-2"
          disabled={isBusy}
          onClick={() => {
            sendToMixpanel("Signed In", { method: "google" });
            signIn("google");
          }}
          variant="outlined"
        >
          <SvgIcon id="google" />
          {i18n("Sign in with Google")}
        </Button>
      </div>
    </>
  );
};

export function SignInForm() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={publicConfig.recaptcha.siteKey}>
      <SignIn />
    </GoogleReCaptchaProvider>
  );
}

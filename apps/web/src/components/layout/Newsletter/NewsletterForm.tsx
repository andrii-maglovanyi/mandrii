"use client";

import { ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { FormEvent, useState } from "react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

import { ActionButton, Alert, Button, Input, RichText } from "~/components/ui";
import { useForm } from "~/hooks/useForm";
import { useI18n } from "~/i18n/useI18n";
import { publicConfig } from "~/lib/config/public";
import { sendToMixpanel } from "~/lib/mixpanel";
import { getEmailFormSchema } from "~/lib/validation/email";

export function NewsletterForm() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={publicConfig.recaptcha.siteKey}>
      <Newsletter />
    </GoogleReCaptchaProvider>
  );
}

function Newsletter() {
  const [status, setStatus] = useState<"already_subscribed" | "error" | "idle" | "sending" | "verification_email_sent">(
    "idle",
  );

  const { executeRecaptcha } = useGoogleReCaptcha();
  const i18n = useI18n();
  const pathname = usePathname();
  const locale = useLocale();

  const { getFieldProps, isFormValid, setFieldErrorsFromServer, validateForm, values } = useForm({
    schema: getEmailFormSchema(i18n),
  });

  const isSubscribedPage = pathname.includes("/newsletter/subscribed");

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!executeRecaptcha) {
      setStatus("error");
      return;
    }

    setStatus("sending");

    try {
      const captchaToken = await executeRecaptcha("newsletter_form");
      const res = await fetch(`/api/newsletter/subscribe?locale=${locale}`, {
        body: JSON.stringify({ captchaToken, ...values }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const result = await res.json();

      if (result.status) {
        sendToMixpanel("Newsletter Email Submitted", {
          locale,
          status: result.status,
        });
        setStatus(result.status);
      } else {
        setStatus("error");
        if (result.details) {
          setFieldErrorsFromServer(result.details);
        }
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setStatus("error");
    }
  };

  const renderMessage = () => {
    switch (status) {
      case "already_subscribed":
        return (
          <>
            <RichText as="p">
              {i18n("Hold up - **{email}**, you're already subscribed!", {
                email: values.email,
              })}
            </RichText>
            <p>{i18n("And hey, I really appreciate that")}</p>
          </>
        );
      case "error":
        return (
          <>
            <p>{i18n("Holy cow!")}</p>
            <Alert
              className="mb-4"
              dismissLabel={i18n("Dismiss alert")}
              onDismiss={() => {
                setStatus("idle");
              }}
            >
              {i18n("Failed to subscribe. Please try again.")}
            </Alert>
          </>
        );
      case "verification_email_sent":
        return (
          <>
            <RichText as="p">
              {i18n("Almost there! Now venture to **{email}** inbox.", {
                email: values.email,
              })}
            </RichText>
            <p>{i18n("And verify that you indeed own your email by clicking that button.")}</p>
          </>
        );
      default:
        return null;
    }
  };

  if (isSubscribedPage) return null;

  return (
    <div className={`
      w-full max-w-full space-y-3
      md:max-w-lg
    `}>
      <h3 className="font-semibold">{i18n("Newsletter")}</h3>
      {!["idle", "sending"].includes(status) ? (
        renderMessage()
      ) : (
        <>
          <p>{i18n("Subscribe, and I'll send you real letters")}</p>

          <form className="flex" onSubmit={handleSubscribe}>
            <div className="flex w-full flex-col">
              <Input
                disabled={status === "sending"}
                placeholder={i18n("Your email")}
                required
                type="email"
                {...getFieldProps("email")}
              />
            </div>
            <span className={`
              hidden
              sm:block
              md:hidden
              lg:block
            `}>
              <Button busy={status === "sending"} className="ml-3" disabled={!isFormValid} type="submit">
                {status === "sending" ? i18n("Sending") : i18n("Subscribe")}
              </Button>
            </span>
            <span className={`
              sm:hidden
              md:block
              lg:hidden
            `}>
              <ActionButton
                aria-label={status === "sending" ? i18n("Sending") : i18n("Subscribe")}
                busy={status === "sending"}
                className="ml-3"
                disabled={!isFormValid}
                icon={<ArrowRight />}
                type="submit"
              />
            </span>
          </form>
        </>
      )}
    </div>
  );
}

"use client";

import { MailCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { FormEvent, useState } from "react";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

import { MixpanelTracker } from "~/components/layout";
import { Alert, Button, Input, Textarea } from "~/components/ui";
import { useForm } from "~/hooks/useForm";
import { useI18n } from "~/i18n/useI18n";
import { publicConfig } from "~/lib/config/public";
import { getContactFormSchema } from "~/lib/validation/contact";

const Contact = () => {
  const i18n = useI18n();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { data: profileData } = useSession();

  const {
    getFieldProps,
    isFormValid,
    setFieldErrorsFromServer,
    validateForm,
    values,
  } = useForm({
    initialValues: {
      email: profileData?.user?.email ?? "",
      name: profileData?.user?.name ?? "",
    },
    schema: getContactFormSchema(i18n),
  });

  const locale = useLocale();
  const [status, setStatus] = useState<"error" | "idle" | "sending" | "sent">(
    "idle",
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus("sending");
    if (!executeRecaptcha) {
      setStatus("error");
      return;
    }

    try {
      const captchaToken = await executeRecaptcha("contact_form");

      const res = await fetch(`/api/contact?locale=${locale}`, {
        body: JSON.stringify({ captchaToken, ...values }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const result = await res.json();

      if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
        if (result.details) {
          setFieldErrorsFromServer(result.details);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("error");
    }
  };

  const isSending = status === "sending";

  if (status === "sent") {
    return (
      <div
        className={`
          mx-auto flex flex-grow flex-col items-center justify-center space-y-6
          text-center
        `}
      >
        <MailCheck size={50} />
        <h1 className="text-4xl font-bold">
          {i18n("Thanks for your message!")}
        </h1>
        <p className="text-lg">{i18n("I'll get back to you soon.")}</p>
        <MixpanelTracker event="Message Sent via Contact Form" />
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold text-on-surface">
        {i18n("Contact me")}
      </h1>

      {status === "error" && (
        <Alert dismissLabel={i18n("Dismiss alert")}>
          {i18n("Failed to send message. Please try again.")}
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          disabled={isSending}
          label={i18n("Name")}
          name="name"
          placeholder={`${i18n("Your name")}`}
          required
          {...getFieldProps("name")}
        />

        <Input
          disabled={isSending}
          label={i18n("Your email")}
          name="email"
          placeholder="example@email.com"
          required
          type="email"
          {...getFieldProps("email")}
        />

        <Textarea
          disabled={isSending}
          label={i18n("Message")}
          maxChars={1000}
          name="message"
          placeholder={i18n("Just wanted to drop you a quick note about...")}
          required
          rows={7}
          {...getFieldProps("message")}
        />

        <div className="flex justify-end">
          <Button
            busy={isSending}
            color="primary"
            disabled={!isFormValid}
            type="submit"
          >
            {i18n("Send message")}
          </Button>
        </div>
      </form>
    </>
  );
};

export function ContactForm() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={publicConfig.recaptcha.siteKey}>
      <Contact />
    </GoogleReCaptchaProvider>
  );
}

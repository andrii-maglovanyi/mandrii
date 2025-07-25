import { MailCheck } from "lucide-react";

import { useI18n } from "~/i18n/useI18n";

export default function VerifyRequestPage() {
  const i18n = useI18n();

  return (
    <div
      className={`
        mx-auto flex flex-grow flex-col items-center justify-center space-y-6
        text-center
      `}
    >
      <MailCheck size={50} />
      <h1 className="text-4xl font-bold">{i18n("Check your email")}</h1>
      <p className="text-lg">
        {i18n("A sign-in link has been sent to your email address.")}
      </p>
      <p className="text-sm text-neutral-500">
        {i18n("Didn't get the email? Check your spam folder or try again.")}
      </p>
    </div>
  );
}

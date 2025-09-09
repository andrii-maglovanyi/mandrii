import { MailCheck } from "lucide-react";

import { MixpanelTracker } from "~/components/layout";
import { useI18n } from "~/i18n/useI18n";

export default function VerifiedEmailPage() {
  const i18n = useI18n();

  return (
    <div className={`
      mx-auto flex flex-grow flex-col items-center justify-center space-y-6
      text-center
    `}>
      <MailCheck size={50} />
      <h1 className="text-4xl font-bold">{i18n("Boom!")}</h1>
      <p className="text-lg">{i18n("You are now subscribed to the newsletter 💛💙")}</p>
      <MixpanelTracker event="Viewed Newsletter Subscribed Page" />
    </div>
  );
}

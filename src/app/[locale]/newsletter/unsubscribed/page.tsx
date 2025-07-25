import { Ban } from "lucide-react";

import { MixpanelTracker } from "~/components/layout";
import { useI18n } from "~/i18n/useI18n";

export default function UnsubscribedPage() {
  const i18n = useI18n();

  return (
    <div
      className={`
        mx-auto flex flex-grow flex-col items-center justify-center space-y-6
        text-center
      `}
    >
      <Ban size={50} />
      <h1 className="text-4xl font-bold">{i18n("Unsubscribed")}</h1>
      <p className="text-lg">
        {i18n(
          "You have been removed from the newsletter. If this was a mistake, you're always welcome back 💛",
        )}
      </p>
      <MixpanelTracker event="Viewed Newsletter Unsubscribed Page" />
    </div>
  );
}

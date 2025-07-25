"use client";

import { Tooltip } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";

interface InfoLineProps {
  icon: React.ReactNode;
  info?: null | string;
  isLink?: boolean;
  tooltipText: string;
}

export const InfoLine = ({
  icon,
  info,
  isLink = false,
  tooltipText,
}: InfoLineProps) => {
  const { showSuccess } = useNotifications();
  const i18n = useI18n();

  const copyData = () => {
    if (info) {
      sendToMixpanel("Copied Location Info", { info });

      navigator.clipboard.writeText(info);
      showSuccess(info, { header: i18n("Copied") });
    }
  };

  if (info) {
    return (
      <div
        className={`
          flex w-full cursor-pointer items-center gap-2 px-8 py-1.5
          hover:bg-on-surface/5
        `}
      >
        {icon}
        {isLink ? (
          <a
            href={info}
            onClick={(e) => {
              e.stopPropagation();
              sendToMixpanel("Clicked Location URL", { link: info });
            }}
            target="_black"
          >
            {info}
          </a>
        ) : (
          <Tooltip label={tooltipText}>
            <button onClick={copyData}>{info}</button>
          </Tooltip>
        )}
      </div>
    );
  }

  return null;
};

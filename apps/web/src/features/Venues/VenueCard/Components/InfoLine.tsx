"use client";

import clsx from "clsx";
import { ArrowUpRight, Copy } from "lucide-react";

import { Tooltip } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";

interface InfoLineProps {
  hideUntilHover?: boolean;
  icon: React.ReactNode;
  info?: null | string;
  isLink?: boolean;
  tooltipText: string;
}

/**
 * Displays a single line of venue information with icon and interactive element.
 * Can be either a clickable link or a copy-to-clipboard button.
 *
 * @param {InfoLineProps} props - Component props.
 * @returns {JSX.Element | null} The info line component or null if no info.
 */
export const InfoLine = ({ hideUntilHover = false, icon, info, isLink = false, tooltipText }: InfoLineProps) => {
  const { showSuccess } = useNotifications();
  const i18n = useI18n();

  // Early return if no info to display
  if (!info) {
    return null;
  }

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    sendToMixpanel("Copied Venue Info", { info });
    navigator.clipboard.writeText(info);
    showSuccess(info, { header: i18n("Copied") });
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    sendToMixpanel("Clicked Venue URL", { link: info });
  };

  const iconClasses = clsx(
    "ml-auto stroke-neutral-disabled",
    hideUntilHover &&
      `
        opacity-0 transition-opacity
        group-hover/info:opacity-100
      `,
  );

  return (
    <div className={`
      group/info flex w-full items-center justify-between text-left
      hover:bg-on-surface/5
    `}>
      {isLink ? (
        <a
          className="flex min-w-0 flex-1 items-center gap-2 px-4 py-1.5"
          href={info}
          onClick={handleLinkClick}
          rel="noopener noreferrer"
          target="_blank"
        >
          {icon}
          <span className="min-w-0 truncate">{info}</span>
          <ArrowUpRight className={iconClasses} size={16} />
        </a>
      ) : (
        <Tooltip className="w-full! flex-1" label={tooltipText}>
          <button
            className={`
              flex w-full min-w-0 cursor-pointer items-center gap-2 px-4 py-1.5
              text-left
            `}
            onClick={handleCopy}
          >
            {icon}
            <span className="min-w-0 truncate">{info}</span>
            <Copy className={iconClasses} size={16} />
          </button>
        </Tooltip>
      )}
    </div>
  );
};

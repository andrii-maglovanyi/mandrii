"use client";

import clsx from "clsx";
import { ArrowUpRight, Copy } from "lucide-react";

import { ActionButton, Tooltip } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { processPhoneNumber } from "~/lib/utils";

interface InfoLineProps {
  hideUntilHover?: boolean;
  icon?: React.ReactNode;
  info?: null | string;
  isAddress?: boolean;
  isEmail?: boolean;
  isLink?: boolean;
  isPhoneNumber?: boolean;
  strikethrough?: boolean;
  tooltipText: string;
}

/**
 * Displays a single line of venue information with icon and interactive element.
 * Can be either a clickable link or a copy-to-clipboard button.
 */
export const InfoLine = ({
  hideUntilHover,
  icon = <></>,
  info,
  isAddress,
  isEmail,
  isLink,
  isPhoneNumber,
  strikethrough,
  tooltipText,
}: InfoLineProps) => {
  const { showSuccess } = useNotifications();
  const i18n = useI18n();

  if (!info) {
    return null;
  }

  const handleCopy = (e: React.MouseEvent) => {
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

  const hideClasses = hideUntilHover ? "opacity-0 transition-opacity group-hover/info:opacity-100" : "";

  // Render link-based info lines (email, address, phone)
  const renderLinkLine = (href: string, copyLabel: string, leadingIcon?: React.ReactNode) => (
    <div className="flex min-w-0 flex-1 justify-between py-0.5 pr-2 pl-4">
      <div className="flex min-w-0 items-center gap-2 text-neutral">
        {leadingIcon || icon}
        {strikethrough ? (
          <Tooltip label={i18n("This venue is archived")}>
            <span className="min-w-0 cursor-default truncate line-through">{info}</span>
          </Tooltip>
        ) : (
          <a
            className="min-w-0 truncate"
            href={href}
            onClick={handleLinkClick}
            rel="noopener noreferrer"
            target="_blank"
          >
            {info}
          </a>
        )}
      </div>

      <ActionButton
        aria-label={copyLabel}
        className={hideClasses}
        disabled={strikethrough}
        icon={<Copy size={16} />}
        onClick={handleCopy}
        size="sm"
        variant="ghost"
      />
    </div>
  );

  // Phone number with country flag
  if (isPhoneNumber) {
    const data = processPhoneNumber(info);
    return (
      <div className={`
        group/info flex w-full items-center justify-between text-left
        hover:bg-on-surface/5
      `}>
        {renderLinkLine(`tel:${data.formatted}`, i18n("Copy phone number"), data.detectedCountry?.flag)}
      </div>
    );
  }

  // Email
  if (isEmail) {
    return (
      <div className={`
        group/info flex w-full items-center justify-between text-left
        hover:bg-on-surface/5
      `}>
        {renderLinkLine(`mailto:${info}`, i18n("Copy email address"))}
      </div>
    );
  }

  // Address (Google Maps)
  if (isAddress) {
    return (
      <div className={`
        group/info flex w-full items-center justify-between text-left
        hover:bg-on-surface/5
      `}>
        {renderLinkLine(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info)}`,
          i18n("Copy address"),
        )}
      </div>
    );
  }

  // External link with arrow
  if (isLink) {
    return (
      <div className={`
        group/info flex w-full items-center justify-between text-left
        hover:bg-on-surface/5
      `}>
        <div className={`
          flex min-w-0 flex-1 items-center justify-between px-4 py-2
        `}>
          <div className="flex min-w-0 items-center gap-2 text-neutral">
            {icon}
            <a
              className="min-w-0 truncate"
              href={info}
              onClick={handleLinkClick}
              rel="noopener noreferrer"
              target="_blank"
            >
              {info}
            </a>
          </div>

          <ArrowUpRight className={clsx(hideClasses, `
            ml-auto stroke-neutral-disabled
          `)} size={16} />
        </div>
      </div>
    );
  }

  // Default: copy-to-clipboard button
  return (
    <div className={`
      group/info flex w-full items-center justify-between text-left
      hover:bg-on-surface/5
    `}>
      <Tooltip className="w-full! flex-1" label={tooltipText}>
        <button
          className={`
            flex w-full min-w-0 cursor-pointer items-center gap-2 px-4 py-2
            text-left
          `}
          onClick={handleCopy}
        >
          {icon}
          <span className="min-w-0 truncate">{info}</span>
          <Copy className={hideClasses} size={16} />
        </button>
      </Tooltip>
    </div>
  );
};

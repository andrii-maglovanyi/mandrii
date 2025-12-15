"use client";

import clsx from "clsx";
import { ArrowUpRight, Copy } from "lucide-react";

import { ActionButton, Tooltip } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { copyToClipboard } from "~/lib/clipboard";
import { getFlagComponent } from "~/lib/icons/flags";
import { sendToMixpanel } from "~/lib/mixpanel";
import { normalizeUrl, processPhoneNumber } from "~/lib/utils";

interface InfoLineProps {
  hideUntilHover?: boolean;
  icon?: React.ReactNode;
  info?: null | string;
  isAddress?: boolean;
  isEmail?: boolean;
  isLink?: boolean;
  isPhoneNumber?: boolean;
  strikethrough?: boolean;
  tooltipText?: string;
  withCopy?: boolean;
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
  withCopy = false,
}: InfoLineProps) => {
  const { showSuccess } = useNotifications();
  const i18n = useI18n();

  if (!info) {
    return null;
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    sendToMixpanel("Copied Venue Info", { info });

    try {
      await copyToClipboard(info);
      showSuccess(info, { header: i18n("Copied") });
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    sendToMixpanel("Clicked Venue URL", { link: info });
  };

  const hideClasses = hideUntilHover ? "opacity-0 transition-opacity group-hover/info:opacity-100" : "";

  // Render link-based info lines (email, address, phone)
  const renderLinkLine = (href: string, copyLabel: string, leadingIcon?: React.ReactNode) => (
    <div className="flex min-w-0 flex-1 justify-between py-0.5 pr-2 pl-4">
      <div className="text-neutral flex min-w-0 items-center gap-2">
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
    const CountryFlag = getFlagComponent(data.detectedCountry?.country);
    return (
      <div className={`group/info hover:bg-on-surface/5 flex w-full items-center justify-between text-left`}>
        {renderLinkLine(
          `tel:${data.formatted}`,
          i18n("Copy phone number"),
          CountryFlag ? <CountryFlag className="h-3 w-4 rounded-xs" /> : null,
        )}
      </div>
    );
  }

  // Email
  if (isEmail) {
    return (
      <div className={`group/info hover:bg-on-surface/5 flex w-full items-center justify-between text-left`}>
        {renderLinkLine(`mailto:${info}`, i18n("Copy email address"))}
      </div>
    );
  }

  // Address (Google Maps)
  if (isAddress) {
    return (
      <div className={`group/info hover:bg-on-surface/5 flex w-full items-center justify-between text-left`}>
        {renderLinkLine(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info)}`,
          i18n("Copy address"),
        )}
      </div>
    );
  }

  if (isLink) {
    return (
      <div className={`group/info hover:bg-on-surface/5 flex w-full items-center justify-between text-left`}>
        <div className={`flex min-w-0 flex-1 items-center justify-between px-4 py-2`}>
          <div className="text-neutral flex min-w-0 items-center gap-2">
            {icon}
            <a
              className="min-w-0 truncate"
              href={info}
              onClick={handleLinkClick}
              rel="noopener noreferrer"
              target="_blank"
            >
              {normalizeUrl(info).display}
            </a>
          </div>

          <ArrowUpRight className={clsx(hideClasses, `stroke-neutral-disabled ml-auto`)} size={16} />
        </div>
      </div>
    );
  }

  // Default: copy-to-clipboard button or plain text
  if (withCopy && tooltipText) {
    return (
      <div className={`group/info hover:bg-on-surface/5 flex w-full items-center justify-between text-left`}>
        <Tooltip className="w-full! flex-1" label={tooltipText}>
          <button
            className={`flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 px-4 py-2 text-left`}
            onClick={handleCopy}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-neutral">{icon}</span>
              <span className="min-w-0 truncate">{info}</span>
            </div>
            <Copy className={hideClasses} size={16} />
          </button>
        </Tooltip>
      </div>
    );
  }

  // Plain text (not withCopy)
  return (
    <div className={`text-neutral hover:bg-on-surface/5 flex w-full items-center px-4 py-2 text-left`}>
      {icon && <span className="mr-2">{icon}</span>}
      <span className="text-on-surface min-w-0 truncate">{info}</span>
    </div>
  );
};

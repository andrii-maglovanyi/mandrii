"use client";

import clsx from "clsx";

import { SvgIcon, Tooltip } from "~/components/ui";
import { baseClass, variantClasses } from "~/components/ui/Button/styles";
import { sendToMixpanel } from "~/lib/mixpanel";

import { PlatformLinkProps, SOCIAL_LINKS } from "./link-configs";

export const PlatformLink = ({
  href,
  label,
  size = "medium",
  type,
}: Readonly<PlatformLinkProps>) => {
  const handleClick = () => {
    if (SOCIAL_LINKS.map(({ type }) => type).includes(type)) {
      sendToMixpanel("Clicked Support Link", { platform: label });
    } else {
      sendToMixpanel("Clicked Social Link", { platform: label });
    }
  };

  return (
    <Tooltip label={label}>
      <a
        className={clsx(
          baseClass,
          variantClasses.ghost.neutral,
          `
            fill-on-surface p-2 text-surface
            hover:text-surface-tint
          `,
        )}
        href={href}
        onClick={handleClick}
        rel="noopener noreferrer"
        target="_blank"
      >
        <SvgIcon id={type} size={size} />
        <span className="sr-only">{label}</span>
      </a>
    </Tooltip>
  );
};

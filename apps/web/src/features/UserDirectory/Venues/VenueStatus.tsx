import clsx from "clsx";
import { Archive, CheckCircle2, Clock, EyeOff, XCircle } from "lucide-react";

import { Tooltip } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { Venue_Status_Enum } from "~/types";

interface VenueStatusProps {
  expanded?: boolean;
  status: unknown;
}

export const VenueStatus = ({ expanded, status }: VenueStatusProps) => {
  const i18n = useI18n();

  let icon = <Clock className="stroke-surface" size={18} />;
  let label = i18n("Pending");

  if (status === Venue_Status_Enum.Active) {
    label = i18n("Active");
    icon = <CheckCircle2 className="stroke-surface" size={18} />;
  } else if (status === Venue_Status_Enum.Rejected) {
    label = i18n("Rejected");
    icon = <XCircle className="stroke-surface" size={18} />;
  } else if (status === Venue_Status_Enum.Archived) {
    label = i18n("Archived");
    icon = <Archive className="stroke-surface" size={18} />;
  } else if (status === Venue_Status_Enum.Hidden) {
    label = i18n("Hidden");
    icon = <EyeOff className="stroke-surface" size={18} />;
  }

  const expandedStatusView = (
    <div className="flex items-center">
      {icon} <span className="ml-1">{label}</span>
    </div>
  );

  const statusView = (
    <>
      <div className={`
        hidden grow justify-center align-middle
        md:flex
      `}>
        <Tooltip label={label}>{icon}</Tooltip>
      </div>
      <div className="md:hidden">{expandedStatusView}</div>
    </>
  );

  return (
    <div
      className={clsx(
        `
          flex w-min cursor-default items-center justify-center text-xs
          font-medium uppercase
        `,
        status === Venue_Status_Enum.Active && `
          bg-green-600/75 text-surface
          dark:bg-green-400/75
        `,
        status === Venue_Status_Enum.Rejected && `
          bg-red-600/75 text-surface
          dark:bg-red-400/75
        `,
        status === Venue_Status_Enum.Archived && `
          bg-gray-600/75 text-surface
          dark:bg-gray-400/75
        `,
        status === Venue_Status_Enum.Hidden && `
          bg-slate-600/25 text-surface
          dark:bg-slate-500/25
        `,
        status === Venue_Status_Enum.Pending && `
          bg-blue-600/75 text-surface
          dark:bg-blue-400/75
        `,
        expanded ? "rounded-md px-2 py-1" : `
          rounded-md p-1.5
          md:rounded-full
        `,
      )}
    >
      {expanded ? expandedStatusView : statusView}
    </div>
  );
};

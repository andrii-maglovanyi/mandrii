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

  let icon = <Clock className="fill-blue-500/10 stroke-blue-500" />;
  let label = i18n("Pending");

  if (status === Venue_Status_Enum.Active) {
    label = i18n("Active");
    icon = <CheckCircle2 className="fill-green-500/10 stroke-green-500" />;
  } else if (status === Venue_Status_Enum.Rejected) {
    label = i18n("Rejected");
    icon = <XCircle className="fill-red-500/10 stroke-red-500" />;
  } else if (status === Venue_Status_Enum.Archived) {
    label = i18n("Archived");
    icon = <Archive className="fill-gray-500/10 stroke-gray-500" />;
  } else if (status === Venue_Status_Enum.Hidden) {
    label = i18n("Hidden");
    icon = <EyeOff className="fill-slate-500/10 stroke-slate-500" />;
  }

  const expandedStatusView = (
    <div className="flex items-center">
      {icon} <span className="ml-2">{label}</span>
    </div>
  );

  if (expanded) {
    return expandedStatusView;
  }

  return (
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
};

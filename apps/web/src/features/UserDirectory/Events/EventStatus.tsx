import clsx from "clsx";
import { Archive, CalendarCheck, CalendarClock, CalendarX, CheckCircle2, Clock, FileText } from "lucide-react";

import { Tooltip } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { Event_Status_Enum } from "~/types";

interface EventStatusProps {
  expanded?: boolean;
  status: unknown;
}

export const EventStatus = ({ expanded, status }: EventStatusProps) => {
  const i18n = useI18n();

  let icon = <Clock className="stroke-surface" size={18} />;
  let label = i18n("Pending");

  if (status === Event_Status_Enum.Active) {
    label = i18n("Active");
    icon = <CheckCircle2 className="stroke-surface" size={18} />;
  } else if (status === Event_Status_Enum.Draft) {
    label = i18n("Draft");
    icon = <FileText className="stroke-surface" size={18} />;
  } else if (status === Event_Status_Enum.Cancelled) {
    label = i18n("Cancelled");
    icon = <CalendarX className="stroke-surface" size={18} />;
  } else if (status === Event_Status_Enum.Completed) {
    label = i18n("Completed");
    icon = <CalendarCheck className="stroke-surface" size={18} />;
  } else if (status === Event_Status_Enum.Postponed) {
    label = i18n("Postponed");
    icon = <CalendarClock className="stroke-surface" size={18} />;
  } else if (status === Event_Status_Enum.Archived) {
    label = i18n("Archived");
    icon = <Archive className="stroke-surface" size={18} />;
  }

  return (
    <div
      className={clsx(
        `
          flex w-min cursor-default items-center justify-center text-xs
          font-medium uppercase
        `,
        status === Event_Status_Enum.Active && `
          bg-green-600/75 text-surface
          dark:bg-green-400/75
        `,
        status === Event_Status_Enum.Draft && `
          bg-gray-600/75 text-surface
          dark:bg-gray-400/75
        `,
        status === Event_Status_Enum.Cancelled && `
          bg-red-600/75 text-surface
          dark:bg-red-400/75
        `,
        status === Event_Status_Enum.Completed && `
          bg-blue-600/75 text-surface
          dark:bg-blue-400/75
        `,
        status === Event_Status_Enum.Postponed && `
          bg-orange-600/75 text-surface
          dark:bg-orange-400/75
        `,
        status === Event_Status_Enum.Archived && `
          bg-slate-600/75 text-surface
          dark:bg-slate-400/75
        `,
        status === Event_Status_Enum.Pending && `
          bg-yellow-600/75 text-surface
          dark:bg-yellow-400/75
        `,
        expanded ? `rounded-md px-3 py-1.5` : `rounded-full p-2`,
      )}
    >
      {expanded ? (
        <div className="flex items-center">
          {icon} <span className="ml-1">{label}</span>
        </div>
      ) : (
        <div className={`flex grow justify-center align-middle`}>
          <Tooltip label={label}>{icon}</Tooltip>
        </div>
      )}
    </div>
  );
};

import { Archive, CalendarCheck, CalendarClock, CalendarX, CheckCircle2, Clock, FileText } from "lucide-react";

import { Badge, Tooltip, type BadgeVariant } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { Event_Status_Enum } from "~/types";

interface EventStatusProps {
  expanded?: boolean;
  status: unknown;
}

export const EventStatus = ({ expanded, status }: EventStatusProps) => {
  const i18n = useI18n();

  let Icon = Clock;
  let label = i18n("Pending");
  let variant: BadgeVariant = "warning";

  if (status === Event_Status_Enum.Active) {
    label = i18n("Active");
    Icon = CheckCircle2;
    variant = "success";
  } else if (status === Event_Status_Enum.Draft) {
    label = i18n("Draft");
    Icon = FileText;
    variant = "neutral";
  } else if (status === Event_Status_Enum.Cancelled) {
    label = i18n("Cancelled");
    Icon = CalendarX;
    variant = "danger";
  } else if (status === Event_Status_Enum.Completed) {
    label = i18n("Completed");
    Icon = CalendarCheck;
    variant = "info";
  } else if (status === Event_Status_Enum.Postponed) {
    label = i18n("Postponed");
    Icon = CalendarClock;
    variant = "warning";
  } else if (status === Event_Status_Enum.Archived) {
    label = i18n("Archived");
    Icon = Archive;
    variant = "neutral";
  }

  if (expanded)
    return (
      <Badge icon={<Icon size={18} />} size="md" variant={variant}>
        {label}
      </Badge>
    );

  return (
    <Tooltip label={label}>
      <Badge aria-label={label} icon={<Icon size={18} />} iconOnly variant={variant} />
    </Tooltip>
  );
};

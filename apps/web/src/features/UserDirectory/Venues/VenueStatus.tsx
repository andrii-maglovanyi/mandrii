import { Archive, CheckCircle2, Clock, EyeOff, XCircle } from "lucide-react";

import { Badge, Tooltip, type BadgeVariant } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { Venue_Status_Enum } from "~/types";

interface VenueStatusProps {
  expanded?: boolean;
  status: unknown;
}

export const VenueStatus = ({ expanded, status }: VenueStatusProps) => {
  const i18n = useI18n();

  let Icon = Clock;
  let label = i18n("Pending");
  let variant: BadgeVariant = "info";

  if (status === Venue_Status_Enum.Active) {
    label = i18n("Active");
    Icon = CheckCircle2;
    variant = "success";
  } else if (status === Venue_Status_Enum.Rejected) {
    label = i18n("Rejected");
    Icon = XCircle;
    variant = "danger";
  } else if (status === Venue_Status_Enum.Archived) {
    label = i18n("Archived");
    Icon = Archive;
    variant = "neutral";
  } else if (status === Venue_Status_Enum.Hidden) {
    label = i18n("Hidden");
    Icon = EyeOff;
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

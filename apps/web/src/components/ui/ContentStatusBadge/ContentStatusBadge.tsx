"use client";

import {
  Archive,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  CheckCircle2,
  Clock,
  EyeOff,
  FileText,
  type LucideIcon,
  XCircle,
} from "lucide-react";

import { useI18n } from "~/i18n/useI18n";
import { Event_Status_Enum, Venue_Status_Enum } from "~/types";

import { Badge, type BadgeVariant } from "../Badge/Badge";
import { Tooltip } from "../Tooltip/Tooltip";

export type ContentStatus = Event_Status_Enum | Venue_Status_Enum;

type ContentStatusBadgeProps = {
  appearance?: "icon" | "label" | "label-with-icon";
  className?: string;
  size?: "md" | "sm";
  status: ContentStatus;
};

type StatusPresentation = {
  icon: LucideIcon;
  label: string;
  variant: BadgeVariant;
};

export const getContentStatusPresentation = (
  status: ContentStatus,
  i18n: (key: string) => string,
): StatusPresentation => {
  switch (status) {
    case Event_Status_Enum.Active:
    case Venue_Status_Enum.Active:
      return { icon: CheckCircle2, label: i18n("Active"), variant: "success" };
    case Event_Status_Enum.Archived:
    case Venue_Status_Enum.Archived:
      return { icon: Archive, label: i18n("Archived"), variant: "neutral" };
    case Event_Status_Enum.Cancelled:
      return { icon: CalendarX, label: i18n("Cancelled"), variant: "danger" };
    case Event_Status_Enum.Completed:
      return { icon: CalendarCheck, label: i18n("Completed"), variant: "info" };
    case Event_Status_Enum.Draft:
      return { icon: FileText, label: i18n("Draft"), variant: "neutral" };
    case Venue_Status_Enum.Hidden:
      return { icon: EyeOff, label: i18n("Hidden"), variant: "neutral" };
    case Event_Status_Enum.Pending:
    case Venue_Status_Enum.Pending:
      return { icon: Clock, label: i18n("Pending"), variant: "warning" };
    case Event_Status_Enum.Postponed:
      return { icon: CalendarClock, label: i18n("Postponed"), variant: "warning" };
    case Venue_Status_Enum.Rejected:
      return { icon: XCircle, label: i18n("Rejected"), variant: "danger" };
  }
};

/** A consistent compact status indicator for venues and events. */
export const ContentStatusBadge = ({
  appearance = "label",
  className,
  size = "sm",
  status,
}: ContentStatusBadgeProps) => {
  const i18n = useI18n();
  const { icon: Icon, label, variant } = getContentStatusPresentation(status, i18n);
  const icon = <Icon aria-hidden size={size === "md" ? 16 : 14} />;

  if (appearance === "icon") {
    return (
      <Tooltip label={label}>
        <Badge aria-label={label} className={className} icon={icon} iconOnly size={size} variant={variant} />
      </Tooltip>
    );
  }

  return (
    <Badge
      className={className}
      icon={appearance === "label-with-icon" ? icon : undefined}
      size={size}
      variant={variant}
    >
      {label}
    </Badge>
  );
};

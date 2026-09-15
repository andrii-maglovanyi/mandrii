import { Event_Status_Enum } from "~/types";

import { isEventScheduleFinished } from "./recurrence";

type EventStatusInput = {
  end_date?: Date | null | string;
  is_recurring?: boolean;
  recurrence_rule?: null | string;
  start_date: Date | string;
  status: Event_Status_Enum;
};

/**
 * Keeps time-bound event state accurate between scheduled status updates.
 * A recurring event only stays active while its RRULE still has occurrences.
 */
export const getEffectiveEventStatus = ({
  end_date,
  is_recurring,
  recurrence_rule,
  start_date,
  status,
}: EventStatusInput) => {
  if (status !== Event_Status_Enum.Active) return status;

  return isEventScheduleFinished({ end_date, is_recurring, recurrence_rule, start_date })
    ? Event_Status_Enum.Completed
    : status;
};

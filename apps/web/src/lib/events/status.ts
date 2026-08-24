import { Event_Status_Enum } from "~/types";

type EventStatusInput = {
  end_date?: null | string;
  is_recurring?: boolean;
  start_date: string;
  status: Event_Status_Enum;
};

/**
 * Keeps time-bound event state accurate between scheduled status updates.
 * Recurring events stay active until they are explicitly completed or archived.
 */
export const getEffectiveEventStatus = ({ end_date, is_recurring, start_date, status }: EventStatusInput) => {
  if (status !== Event_Status_Enum.Active || is_recurring) return status;

  const completionTime = Date.parse(end_date || start_date);
  return Number.isNaN(completionTime) || completionTime >= Date.now() ? status : Event_Status_Enum.Completed;
};

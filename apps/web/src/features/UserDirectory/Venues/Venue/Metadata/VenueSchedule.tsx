import { Clock, Minus, Plus } from "lucide-react";
import { useLocale } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import { AccordionItem, ActionButton, Button, Input, RichText } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { formatTime } from "~/lib/utils";
import { VenueSchema } from "~/lib/validation/venue";
import { DayOfWeek, Locale } from "~/types";

type VenueScheduleProps = Pick<FormProps<VenueSchema["shape"]>, "getFieldProps" | "setValues" | "values">;

const MAX_SLOTS_PER_DAY = 3;

export const VenueSchedule = ({ setValues, values }: VenueScheduleProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());

  const schedules = useMemo(() => values.venue_schedules || [], [values.venue_schedules]);

  const schedulesByDay = useMemo(() => {
    const grouped = new Map<string, typeof schedules>();

    constants.weekdays.forEach((weekday) => {
      const dayKey = weekday.full.en;
      grouped.set(
        dayKey,
        schedules.filter((s) => s.day_of_week === dayKey),
      );
    });

    return grouped;
  }, [schedules]);

  const toggleAccordion = useCallback((day: DayOfWeek) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);

      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }

      return next;
    });
  }, []);

  const updateSchedule = useCallback(
    (day: DayOfWeek, index: number, field: "close_time" | "open_time", value: string) => {
      setValues((prev) => {
        const currentSchedules = prev.venue_schedules || [];

        let currentDayIndex = 0;
        const updatedSchedules = currentSchedules.map((schedule) => {
          if (schedule.day_of_week === day) {
            if (currentDayIndex === index) {
              currentDayIndex++;
              return { ...schedule, [field]: value };
            }
            currentDayIndex++;
          }
          return schedule;
        });

        return { ...prev, venue_schedules: updatedSchedules };
      });
    },
    [setValues],
  );

  const addTimeSlot = useCallback(
    (day: DayOfWeek) => {
      setValues((prev) => ({
        ...prev,
        venue_schedules: [...(prev.venue_schedules || []), { close_time: "", day_of_week: day, open_time: "" }],
      }));
    },
    [setValues],
  );

  const removeTimeSlot = useCallback(
    (day: DayOfWeek, index: number) => {
      setValues((prev) => {
        const currentSchedules = prev.venue_schedules || [];
        let currentDayIndex = 0;

        const updatedSchedules = currentSchedules.filter((schedule) => {
          if (schedule.day_of_week === day) {
            if (currentDayIndex === index) {
              currentDayIndex++;
              return false; // Remove this schedule
            }
            currentDayIndex++;
          }
          return true;
        });

        return { ...prev, venue_schedules: updatedSchedules };
      });
    },
    [setValues],
  );

  const renderTimeSlots = useCallback(
    (day: DayOfWeek) => {
      const daySchedules = schedulesByDay.get(day) || [];

      // If no schedules exist, create one empty slot
      if (daySchedules.length === 0) {
        return (
          <div className="w-fit">
            <div className="mt-2 flex justify-end">
              <Button onClick={() => addTimeSlot(day)} type="button" variant="filled">
                {i18n("Add time slot")}
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className="w-fit space-y-2">
          {daySchedules.map((slot, index) => (
            <div className="flex items-end gap-2" key={slot.id || `${day}-${index}`}>
              <Input
                className="w-32"
                label={index === 0 ? i18n("Opens") : undefined}
                onChange={(e) => updateSchedule(day, index, "open_time", e.target.value)}
                placeholder="09:00"
                type="time"
                value={slot.open_time || ""}
              />
              <span className="text-neutral pb-2">-</span>
              <Input
                className="w-32"
                label={index === 0 ? i18n("Closes") : undefined}
                onChange={(e) => updateSchedule(day, index, "close_time", e.target.value)}
                placeholder="18:00"
                type="time"
                value={slot.close_time || ""}
              />
              <ActionButton
                aria-label={i18n("Remove time slot")}
                icon={<Minus />}
                onClick={() => removeTimeSlot(day, index)}
                tooltipPosition="left"
                type="button"
              />
            </div>
          ))}

          {daySchedules.length < MAX_SLOTS_PER_DAY && (
            <div className="flex justify-end">
              <ActionButton
                aria-label={i18n("Add time slot")}
                icon={<Plus />}
                onClick={() => addTimeSlot(day)}
                tooltipPosition="left"
                type="button"
                variant="filled"
              />
            </div>
          )}
        </div>
      );
    },
    [schedulesByDay, i18n, addTimeSlot, updateSchedule, removeTimeSlot],
  );

  const getDayStatus = useCallback(
    (day: DayOfWeek) => {
      const daySchedules = schedulesByDay.get(day) || [];

      const times = daySchedules
        .filter((s) => s.open_time && s.close_time)
        .map((s) => `${formatTime(s.open_time)}-${formatTime(s.close_time)}`)
        .join(", ");

      return times ? ` - ${times}` : "";
    },
    [schedulesByDay],
  );

  return (
    <div className="space-y-4">
      <RichText as="p" className="text-neutral text-sm">
        {i18n(
          "Set your venue's opening hours for each day of the week. You can add multiple time slots per day (e.g., lunch and dinner hours) or leave a day empty if closed.",
        )}
      </RichText>

      <div className="space-y-2">
        {constants.weekdays.map((weekday) => {
          const day = weekday.full.en;
          const isOpen = openAccordions.has(day);

          return (
            <AccordionItem
              icon={<Clock size={20} />}
              isOpen={isOpen}
              key={day}
              onToggle={() => toggleAccordion(day)}
              title={`${weekday.full[locale]}${getDayStatus(day)}`}
            >
              {renderTimeSlots(day)}
            </AccordionItem>
          );
        })}
      </div>
    </div>
  );
};

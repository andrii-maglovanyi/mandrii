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
const WEEKDAY_DAYS = constants.weekdays.slice(0, 5).map((weekday) => weekday.full.en);

type TimeSlot = {
  close_time?: null | string;
  day_of_week: DayOfWeek;
  id?: string;
  open_time?: null | string;
};

const hasHours = (slots: TimeSlot[]) => slots.some((slot) => Boolean(slot.open_time || slot.close_time));

export const VenueSchedule = ({ setValues, values }: VenueScheduleProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const [quickCloseTime, setQuickCloseTime] = useState("18:00");
  const [quickOpenTime, setQuickOpenTime] = useState("09:00");

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

  const fillEmptyDays = useCallback(
    (days: DayOfWeek[]) => {
      if (!quickOpenTime || !quickCloseTime) return;

      setValues((prev) => {
        const currentSchedules = prev.venue_schedules || [];
        const daysToFill = new Set(
          days.filter((day) => !hasHours(currentSchedules.filter((schedule) => schedule.day_of_week === day))),
        );

        if (!daysToFill.size) return prev;

        return {
          ...prev,
          venue_schedules: [
            ...currentSchedules.filter((schedule) => !daysToFill.has(schedule.day_of_week)),
            ...Array.from(daysToFill, (day) => ({
              close_time: quickCloseTime,
              day_of_week: day,
              open_time: quickOpenTime,
            })),
          ],
        };
      });
    },
    [quickCloseTime, quickOpenTime, setValues],
  );

  const copyPreviousDay = useCallback(
    (day: DayOfWeek) => {
      const dayIndex = constants.weekdays.findIndex((weekday) => weekday.full.en === day);
      if (dayIndex <= 0) return;

      const previousDay = constants.weekdays[dayIndex - 1]?.full.en;
      if (!previousDay) return;

      setValues((prev) => {
        const currentSchedules = prev.venue_schedules || [];
        const targetSlots = currentSchedules.filter((schedule) => schedule.day_of_week === day);
        const sourceSlots = currentSchedules.filter((schedule) => schedule.day_of_week === previousDay);

        if (hasHours(targetSlots) || !hasHours(sourceSlots)) return prev;

        return {
          ...prev,
          venue_schedules: [
            ...currentSchedules.filter((schedule) => schedule.day_of_week !== day),
            ...sourceSlots.map(({ close_time, open_time }) => ({ close_time, day_of_week: day, open_time })),
          ],
        };
      });
    },
    [setValues],
  );

  const renderTimeSlots = useCallback(
    (day: DayOfWeek) => {
      const daySchedules = schedulesByDay.get(day) || [];
      const dayIndex = constants.weekdays.findIndex((weekday) => weekday.full.en === day);
      const previousDay = dayIndex > 0 ? constants.weekdays[dayIndex - 1] : undefined;
      const canCopyPreviousDay =
        Boolean(previousDay) && !hasHours(daySchedules) && hasHours(schedulesByDay.get(previousDay!.full.en) || []);

      // If no schedules exist, create one empty slot
      if (daySchedules.length === 0) {
        return (
          <div className="w-fit">
            <div className="mt-2 flex flex-wrap gap-2">
              {canCopyPreviousDay && previousDay && (
                <Button color="primary" onClick={() => copyPreviousDay(day)} size="sm" type="button" variant="outlined">
                  {i18n("Copy {day} hours", { day: previousDay.full[locale] })}
                </Button>
              )}
              <Button onClick={() => addTimeSlot(day)} size="sm" type="button" variant="filled">
                {i18n("Add time slot")}
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className="w-fit space-y-2">
          {canCopyPreviousDay && previousDay && (
            <Button color="primary" onClick={() => copyPreviousDay(day)} size="sm" type="button" variant="outlined">
              {i18n("Copy {day} hours", { day: previousDay.full[locale] })}
            </Button>
          )}
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
              <span className="pb-2 text-neutral">-</span>
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
    [schedulesByDay, i18n, addTimeSlot, copyPreviousDay, locale, updateSchedule, removeTimeSlot],
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
      <RichText as="p" className="text-sm text-neutral">
        {i18n(
          "Set your venue's opening hours for each day of the week. You can add multiple time slots per day (e.g., lunch and dinner hours) or leave a day empty if closed.",
        )}
      </RichText>

      <section aria-labelledby="quick-hours-heading" className={`
        rounded-xl border border-primary/15 bg-primary/5 p-4
      `}>
        <div className={`
          flex flex-col gap-4
          md:flex-row md:items-end md:justify-between
        `}>
          <div>
            <h3 className="font-semibold" id="quick-hours-heading">
              {i18n("Quick setup")}
            </h3>
            <p className="mt-1 text-sm text-neutral">
              {i18n("Fill only days without hours. You can still customise any day below.")}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <Input
              className="w-28"
              label={i18n("Opens")}
              onChange={(event) => setQuickOpenTime(event.target.value)}
              type="time"
              value={quickOpenTime}
            />
            <Input
              className="w-28"
              label={i18n("Closes")}
              onChange={(event) => setQuickCloseTime(event.target.value)}
              type="time"
              value={quickCloseTime}
            />
            <Button
              color="primary"
              disabled={!quickOpenTime || !quickCloseTime}
              onClick={() => fillEmptyDays(WEEKDAY_DAYS)}
              size="sm"
              type="button"
              variant="outlined"
            >
              {i18n("Fill empty weekdays")}
            </Button>
            <Button
              color="primary"
              disabled={!quickOpenTime || !quickCloseTime}
              onClick={() => fillEmptyDays(constants.weekdays.map((weekday) => weekday.full.en))}
              size="sm"
              type="button"
            >
              {i18n("Fill all empty days")}
            </Button>
          </div>
        </div>
      </section>

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

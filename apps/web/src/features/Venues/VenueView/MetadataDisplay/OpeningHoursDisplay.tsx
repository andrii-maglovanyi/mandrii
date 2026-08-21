import { Clock } from "lucide-react";
import { useLocale } from "next-intl";

import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { formatTime } from "~/lib/utils";
import { GetPublicVenuesQuery, Locale } from "~/types";

import { MetadataSection } from "./MetadataSection";
import { clsx } from "clsx";
import { Tooltip } from "~/components/ui";

interface OpeningHoursDisplayProps {
  schedules?: GetPublicVenuesQuery["venues"][number]["venue_schedules"];
  isArchived: boolean;
}

export const OpeningHoursDisplay = ({ schedules, isArchived }: OpeningHoursDisplayProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  if (!schedules?.length) return null;

  const today = new Date().getDay();
  const mondayFirstIndex = today === 0 ? 6 : today - 1;
  const currentDayName = constants.weekdays[mondayFirstIndex].full.en;

  return (
    <MetadataSection icon={Clock} title={i18n("Opening hours")}>
      {constants.weekdays.map((day) => {
        const daySchedules = schedules.filter((s) => s.day_of_week === day.full.en);
        const isToday = day.full.en === currentDayName;

        return (
          <div
            className={clsx(
              "hover:bg-on-surface/5 -mx-4 flex cursor-default items-start justify-between px-4 py-2 text-sm",
              isToday && "bg-primary/10 font-semibold",
            )}
            key={day.full.en}
          >
            <span className={`font-medium ${isToday ? "text-primary" : `text-neutral`} `}>{day.full[locale]}</span>
            <div className="flex flex-col items-end gap-0.5">
              {daySchedules.length ? (
                daySchedules.map(({ close_time, open_time }, idx) => (
                  <span
                    className={clsx(isToday ? "text-primary" : "text-on-surface", isArchived && "line-through")}
                    key={idx}
                  >
                    {isArchived ? (
                      <Tooltip label={i18n("This venue is archived")}>
                        {formatTime(open_time)} - {formatTime(close_time)}
                      </Tooltip>
                    ) : (
                      <>
                        {formatTime(open_time)} - {formatTime(close_time)}
                      </>
                    )}
                  </span>
                ))
              ) : (
                <span className={isToday ? "text-primary/60" : "text-neutral/60"}>{i18n("Closed")}</span>
              )}
            </div>
          </div>
        );
      })}
    </MetadataSection>
  );
};

import { Clock } from "lucide-react";
import { useLocale } from "next-intl";

import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { formatTime } from "~/lib/utils";
import { GetPublicVenuesQuery, Locale } from "~/types";

import { MetadataSection } from "./MetadataSection";

interface OpeningHoursDisplayProps {
  schedules?: GetPublicVenuesQuery["venues"][number]["venue_schedules"];
}

export const OpeningHoursDisplay = ({ schedules }: OpeningHoursDisplayProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  if (!schedules?.length) return null;

  return (
    <MetadataSection icon={Clock} title={i18n("Opening hours")}>
      {constants.weekdays.map((day) => {
        const daySchedules = schedules.filter((s) => s.day_of_week === day.full.en);

        return (
          <div
            className={`
              -mx-4 flex items-start justify-between px-4 py-2 text-sm
              hover:bg-on-surface/5
            `}
            key={day.full.en}
          >
            <span className="font-medium text-neutral">{day.full[locale]}</span>
            <div className="flex flex-col items-end gap-0.5">
              {daySchedules.length ? (
                daySchedules.map(({ close_time, open_time }, idx) => (
                  <span className="text-on-surface" key={idx}>
                    {formatTime(open_time)} - {formatTime(close_time)}
                  </span>
                ))
              ) : (
                <span className="text-neutral/60">{i18n("Closed")}</span>
              )}
            </div>
          </div>
        );
      })}
    </MetadataSection>
  );
};

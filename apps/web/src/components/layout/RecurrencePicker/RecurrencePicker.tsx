"use client";

import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { Input, Select } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { buildRecurrenceRule, parseRecurrenceRule, RecurrenceDay, RecurrenceFrequency } from "~/lib/events/recurrence";
import { Locale } from "~/types";

type EndType = "COUNT" | "DATE" | "NEVER";

interface RecurrencePickerProps {
  disabled?: boolean;
  onChange?: (value: string) => void;
  startDate?: Date | null | string;
  value?: null | string;
}

export const RecurrencePicker = ({ disabled = false, onChange, startDate, value }: RecurrencePickerProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  // Parse initial value
  const parseRRule = useCallback((rrule: null | string | undefined): RecurrenceState => {
    if (!rrule) {
      return {
        count: 10,
        endDate: "",
        endType: "NEVER",
        frequency: "WEEKLY",
        interval: 1,
        selectedDays: [],
      };
    }

    const state: RecurrenceState = {
      count: 10,
      endDate: "",
      endType: "NEVER",
      frequency: "WEEKLY",
      interval: 1,
      selectedDays: [],
    };

    // Parse FREQ
    const parsedRule = parseRecurrenceRule(rrule);
    if (!parsedRule) return state;

    state.frequency = parsedRule.frequency;
    state.interval = parsedRule.interval;
    state.selectedDays = parsedRule.byDays;
    if (parsedRule.count) {
      state.endType = "COUNT";
      state.count = parsedRule.count;
    } else if (parsedRule.until) {
      state.endType = "DATE";
      state.endDate = parsedRule.until.toISOString().slice(0, 10);
    }

    return state;
  }, []);

  interface RecurrenceState {
    count: number;
    endDate: string;
    endType: EndType;
    frequency: RecurrenceFrequency;
    interval: number;
    selectedDays: RecurrenceDay[];
  }

  const [state, setState] = useState<RecurrenceState>(() => parseRRule(value));

  // Update state when external value changes (e.g., loading different event)
  useEffect(() => {
    setState(parseRRule(value));
  }, [value, parseRRule]);

  // Store latest onChange callback in ref to avoid dependency issues
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Build RRULE string
  const buildRRule = useCallback((currentState: RecurrenceState): string => {
    return buildRecurrenceRule({
      byDays: currentState.selectedDays,
      count: currentState.endType === "COUNT" ? currentState.count : undefined,
      frequency: currentState.frequency,
      interval: currentState.interval,
      until: currentState.endType === "DATE" ? currentState.endDate : undefined,
    });
  }, []);

  // Notify parent when state changes
  useEffect(() => {
    const rrule = buildRRule(state);
    onChangeRef.current?.(rrule);
  }, [state, buildRRule]);

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState((prev) => ({ ...prev, frequency: e.target.value as RecurrenceFrequency }));
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const interval = parseInt(e.target.value, 10) || 1;
    setState((prev) => ({ ...prev, interval: Math.min(1000, Math.max(1, interval)) }));
  };

  const handleDayToggle = (day: RecurrenceDay) => {
    setState((prev) => {
      const selectedDays = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day];
      return { ...prev, selectedDays };
    });
  };

  const handleEndTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState((prev) => ({ ...prev, endType: e.target.value as EndType }));
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10) || 1;
    setState((prev) => ({ ...prev, count: Math.min(1000, Math.max(1, count)) }));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, endDate: e.target.value }));
  };

  const frequencyOptions = [
    { label: i18n("Daily"), value: "DAILY" },
    { label: i18n("Weekly"), value: "WEEKLY" },
    { label: i18n("Monthly"), value: "MONTHLY" },
    { label: i18n("Yearly"), value: "YEARLY" },
  ];

  const endTypeOptions = [
    { label: i18n("Never"), value: "NEVER" },
    { label: i18n("After"), value: "COUNT" },
    { label: i18n("On date"), value: "DATE" },
  ];

  const { weekdays } = constants;

  const daysOfWeek: { day: RecurrenceDay; label: string }[] = [
    { day: "MO", label: weekdays[0].short[locale] },
    { day: "TU", label: weekdays[1].short[locale] },
    { day: "WE", label: weekdays[2].short[locale] },
    { day: "TH", label: weekdays[3].short[locale] },
    { day: "FR", label: weekdays[4].short[locale] },
    { day: "SA", label: weekdays[5].short[locale] },
    { day: "SU", label: weekdays[6].short[locale] },
  ];

  // Generate human-readable description
  const getDescription = (): string => {
    const { count, endDate, endType, frequency, interval, selectedDays } = state;

    let desc = i18n("Repeats");

    // Frequency
    if (frequency === "DAILY") {
      desc += interval === 1 ? ` ${i18n("Daily")}` : ` ${i18n("Every {count} days", { count: interval })}`;
    } else if (frequency === "WEEKLY") {
      if (interval === 1) {
        desc += ` ${i18n("Weekly")}`;
      } else {
        desc += ` ${i18n("Every {count} weeks", { count: interval })}`;
      }
      if (selectedDays.length > 0) {
        const dayLabels = selectedDays
          .map((d) => daysOfWeek.find((dw) => dw.day === d)?.label)
          .filter(Boolean)
          .join(", ");
        desc += ` ${i18n("on")} ${dayLabels}`;
      }
    } else if (frequency === "MONTHLY") {
      desc += interval === 1 ? ` ${i18n("Monthly")}` : ` ${i18n("Every {count} months", { count: interval })}`;
    } else if (frequency === "YEARLY") {
      desc += interval === 1 ? ` ${i18n("Yearly")}` : ` ${i18n("Every {count} years", { count: interval })}`;
    }

    // End condition
    if (endType === "COUNT") {
      desc += `, ${i18n("{count} times", { count })}`;
    } else if (endType === "DATE" && endDate) {
      const date = new Date(endDate);
      desc += `, ${i18n("until")} ${date.toLocaleDateString()}`;
    }

    return desc;
  };

  return (
    <div className={`
      space-y-4 rounded-lg border border-neutral/20 bg-surface p-4
    `}>
      {/* Frequency */}
      <div className={`
        flex flex-col gap-4
        sm:flex-row
      `}>
        <div className="flex-1">
          <Select
            disabled={disabled}
            label={i18n("Frequency")}
            onChange={handleFrequencyChange}
            options={frequencyOptions}
            value={state.frequency}
          />
        </div>
        <div className="flex-1">
          <Input
            disabled={disabled}
            label={i18n("Every")}
            max={1000}
            min={1}
            onChange={handleIntervalChange}
            placeholder="1"
            type="number"
            value={state.interval}
          />
        </div>
      </div>

      {/* Days of week (only for weekly) */}
      {state.frequency === "WEEKLY" && (
        <div>
          <label className="mb-2 block text-sm font-medium">{i18n("Repeat on")}</label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(({ day, label }) => {
              const isSelected = state.selectedDays.includes(day);
              return (
                <button
                  className={`
                    rounded-lg border px-4 py-2 text-sm font-medium
                    transition-colors
                    ${
                    isSelected ? "border-primary bg-primary" : `
                      border-neutral/20 bg-surface
                      hover:border-primary/50
                    `
                  }
                    ${disabled ? "cursor-not-allowed opacity-50" : `
                      cursor-pointer
                    `}
                  `}
                  disabled={disabled}
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  type="button"
                >
                  {label}
                </button>
              );
            })}
          </div>
          {state.selectedDays.length === 0 && (
            <p className="mt-2 text-xs text-neutral">
              {i18n("Select days or leave empty to repeat on the same day as the start date")}
            </p>
          )}
        </div>
      )}

      {/* End condition */}
      <div>
        <Select
          disabled={disabled}
          label={i18n("Ends")}
          onChange={handleEndTypeChange}
          options={endTypeOptions}
          value={state.endType}
        />
      </div>

      {state.endType === "COUNT" && (
        <Input
          disabled={disabled}
          label={i18n("Number of occurrences")}
          max={1000}
          min={1}
          onChange={handleCountChange}
          placeholder="10"
          type="number"
          value={state.count}
        />
      )}

      {state.endType === "DATE" && (
        <Input
          disabled={disabled}
          label={i18n("End date")}
          min={startDate ? new Date(startDate).toISOString().slice(0, 10) : undefined}
          onChange={handleEndDateChange}
          type="date"
          value={state.endDate}
        />
      )}

      {/* Description */}
      <div className="rounded-lg bg-primary/5 p-3">
        <p className="text-sm font-medium text-neutral">{getDescription()}</p>
      </div>
    </div>
  );
};

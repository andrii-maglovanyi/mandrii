const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type RecurrenceFrequency = "DAILY" | "MONTHLY" | "WEEKLY" | "YEARLY";
export type RecurrenceDay = "FR" | "MO" | "SA" | "SU" | "TH" | "TU" | "WE";

export type RecurrenceRule = {
  byDays: RecurrenceDay[];
  count?: number;
  frequency: RecurrenceFrequency;
  interval: number;
  until?: Date;
};

export const DEFAULT_RECURRENCE_RULE = "FREQ=WEEKLY";

const DAY_CODES: Record<RecurrenceDay, number> = {
  FR: 5,
  MO: 1,
  SA: 6,
  SU: 0,
  TH: 4,
  TU: 2,
  WE: 3,
};

const RECURRENCE_DAYS = new Set<RecurrenceDay>(Object.keys(DAY_CODES) as RecurrenceDay[]);
const RECURRENCE_FREQUENCIES = new Set<RecurrenceFrequency>(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);

const parsePositiveInteger = (value: string | undefined) => {
  if (!value || !/^\d+$/.test(value)) return undefined;

  const parsed = Number.parseInt(value, 10);
  return parsed > 0 && parsed <= 1000 ? parsed : undefined;
};

const parseUntil = (value: string | undefined) => {
  if (!value) return undefined;

  const match = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!match) return undefined;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999));
  return date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
    ? date
    : undefined;
};

/**
 * Parses the deliberately small RRULE dialect produced by RecurrencePicker.
 * Keeping it strict means an invalid stored rule cannot make an event immortal.
 */
export const parseRecurrenceRule = (value: null | string | undefined): RecurrenceRule | null => {
  if (!value) return null;

  const parts = value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  const entries = new Map<string, string>();

  for (const part of parts) {
    const separator = part.indexOf("=");
    if (separator <= 0 || separator === part.length - 1) return null;

    const key = part.slice(0, separator).toUpperCase();
    const entryValue = part.slice(separator + 1).toUpperCase();
    if (entries.has(key) || !["BYDAY", "COUNT", "FREQ", "INTERVAL", "UNTIL"].includes(key)) return null;
    entries.set(key, entryValue);
  }

  const frequency = entries.get("FREQ") as RecurrenceFrequency | undefined;
  if (!frequency || !RECURRENCE_FREQUENCIES.has(frequency)) return null;

  const intervalValue = entries.get("INTERVAL");
  const interval = intervalValue ? parsePositiveInteger(intervalValue) : 1;
  if (!interval) return null;

  const countValue = entries.get("COUNT");
  const count = countValue ? parsePositiveInteger(countValue) : undefined;
  if (countValue && !count) return null;

  const untilValue = entries.get("UNTIL");
  const until = untilValue ? parseUntil(untilValue) : undefined;
  if (untilValue && !until) return null;

  const byDayValue = entries.get("BYDAY");
  const byDays = byDayValue ? (byDayValue.split(",") as RecurrenceDay[]) : [];
  if (
    (byDayValue &&
      (!byDays.length || byDays.some((day) => !RECURRENCE_DAYS.has(day)) || new Set(byDays).size !== byDays.length)) ||
    (frequency !== "WEEKLY" && byDays.length > 0)
  ) {
    return null;
  }

  return { byDays, count, frequency, interval, until };
};

export const isRecurrenceRuleValid = (value: null | string | undefined) => parseRecurrenceRule(value) !== null;

export const buildRecurrenceRule = ({
  byDays = [],
  count,
  frequency,
  interval = 1,
  until,
}: {
  byDays?: RecurrenceDay[];
  count?: number;
  frequency: RecurrenceFrequency;
  interval?: number;
  until?: string;
}) => {
  const parts = [`FREQ=${frequency}`];

  if (interval > 1) parts.push(`INTERVAL=${interval}`);
  if (frequency === "WEEKLY" && byDays.length) parts.push(`BYDAY=${byDays.join(",")}`);
  if (count) parts.push(`COUNT=${count}`);
  if (until) parts.push(`UNTIL=${until.replace(/-/g, "")}`);

  return parts.join(";");
};

const addUtcMonths = (date: Date, months: number) => {
  const targetMonth = date.getUTCMonth() + months;
  const targetYear = date.getUTCFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();

  return new Date(
    Date.UTC(
      targetYear,
      normalizedMonth,
      Math.min(date.getUTCDate(), lastDayOfTargetMonth),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
};

const addUtcYears = (date: Date, years: number) => addUtcMonths(date, years * 12);

// Always calculate month/year occurrences from DTSTART, not the previous
// clamped occurrence. Otherwise a Jan 31 series drifts to the 28th forever.
const getNonByDayOccurrence = (start: Date, occurrenceIndex: number, rule: RecurrenceRule) => {
  const offset = occurrenceIndex - 1;

  switch (rule.frequency) {
    case "DAILY":
      return new Date(start.getTime() + offset * rule.interval * DAY_IN_MS);
    case "MONTHLY":
      return addUtcMonths(start, offset * rule.interval);
    case "YEARLY":
      return addUtcYears(start, offset * rule.interval);
    case "WEEKLY":
      return new Date(start.getTime() + offset * rule.interval * 7 * DAY_IN_MS);
  }
};

const dayCodeForDate = (date: Date): RecurrenceDay => {
  const entry = Object.entries(DAY_CODES).find(([, day]) => day === date.getUTCDay());
  return entry?.[0] as RecurrenceDay;
};

const getOccurrenceDuration = ({
  end_date,
  start_date,
}: {
  end_date?: Date | null | string;
  start_date: Date | string;
}) => {
  const start = new Date(start_date);
  const end = end_date ? new Date(end_date) : start;
  return Number.isNaN(end.getTime()) || end < start ? 0 : end.getTime() - start.getTime();
};

const isAllowedOccurrence = (candidate: Date, index: number, rule: RecurrenceRule) => {
  if (rule.count && index > rule.count) return false;
  return !rule.until || candidate <= rule.until;
};

/** Finds the actual last scheduled occurrence, respecting both COUNT and UNTIL. */
const getFinalOccurrence = (start: Date, rule: RecurrenceRule): Date | null | undefined => {
  if (!rule.count && !rule.until) return null;

  let lastOccurrence: Date | undefined;

  if (rule.frequency === "WEEKLY" && rule.byDays.length) {
    let occurrenceIndex = 0;
    const maxWeekOffset = rule.count ? rule.count * rule.interval + rule.interval : 100_000;
    for (let weekOffset = 0; weekOffset <= maxWeekOffset; weekOffset += rule.interval) {
      for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
        const candidate = new Date(start.getTime() + (weekOffset * 7 + dayOffset) * DAY_IN_MS);
        if (rule.until && candidate > rule.until) return lastOccurrence;
        if (!rule.byDays.includes(dayCodeForDate(candidate))) continue;

        occurrenceIndex += 1;
        if (rule.count && occurrenceIndex > rule.count) return lastOccurrence;
        lastOccurrence = candidate;
        if (rule.count === occurrenceIndex) return lastOccurrence;
      }
    }

    return lastOccurrence;
  }

  for (let occurrenceIndex = 1; occurrenceIndex <= 100_000; occurrenceIndex += 1) {
    const candidate = getNonByDayOccurrence(start, occurrenceIndex, rule);
    if (rule.until && candidate > rule.until) break;
    if (rule.count && occurrenceIndex > rule.count) break;
    lastOccurrence = new Date(candidate);
    if (rule.count === occurrenceIndex) break;
  }

  return lastOccurrence;
};

/**
 * Returns the current or next scheduled occurrence. This keeps recurring cards
 * useful after their original DTSTART is in the past.
 */
export const getNextOccurrenceStart = (
  event: {
    end_date?: Date | null | string;
    is_recurring?: boolean;
    recurrence_rule?: null | string;
    start_date: Date | string;
  },
  now = new Date(),
): Date | undefined => {
  const start = new Date(event.start_date);
  const rule = event.is_recurring ? parseRecurrenceRule(event.recurrence_rule) : null;
  if (Number.isNaN(start.getTime())) return undefined;
  if (!rule) return start;

  const duration = getOccurrenceDuration(event);
  const isRelevant = (candidate: Date) => candidate.getTime() + duration >= now.getTime();

  if (rule.frequency === "WEEKLY" && rule.byDays.length) {
    let occurrenceIndex = 0;
    const maxWeekOffset = rule.count ? rule.count * rule.interval + rule.interval : 100_000;

    for (let weekOffset = 0; weekOffset <= maxWeekOffset; weekOffset += rule.interval) {
      for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
        const candidate = new Date(start.getTime() + (weekOffset * 7 + dayOffset) * DAY_IN_MS);
        if (!rule.byDays.includes(dayCodeForDate(candidate))) continue;

        occurrenceIndex += 1;
        if (!isAllowedOccurrence(candidate, occurrenceIndex, rule)) return undefined;
        if (isRelevant(candidate)) return candidate;
      }
    }

    return undefined;
  }

  for (let occurrenceIndex = 1; occurrenceIndex <= 100_000; occurrenceIndex += 1) {
    const candidate = getNonByDayOccurrence(start, occurrenceIndex, rule);
    if (!isAllowedOccurrence(candidate, occurrenceIndex, rule)) return undefined;
    if (isRelevant(candidate)) return candidate;
  }

  return undefined;
};

export const getOccurrenceEnd = (
  occurrenceStart: Date,
  event: { end_date?: Date | null | string; start_date: Date | string },
) => new Date(occurrenceStart.getTime() + getOccurrenceDuration(event));

/**
 * Whether an event has an occurrence that overlaps a requested time window.
 *
 * SQL can cheaply return recurring series as candidates, but cannot safely
 * calculate their next RRULE occurrence. Keep that last, exact check here so
 * date filters mean the same thing for one-off and recurring events.
 */
export const doesEventOccurInRange = (
  event: {
    end_date?: Date | null | string;
    is_recurring?: boolean;
    recurrence_rule?: null | string;
    start_date: Date | string;
  },
  { from, to }: { from?: Date | string; to?: Date | string },
) => {
  const start = new Date(event.start_date);
  const rangeStart = from ? new Date(from) : start;
  const rangeEnd = to ? new Date(to) : undefined;

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(rangeStart.getTime()) ||
    (rangeEnd && Number.isNaN(rangeEnd.getTime())) ||
    (rangeEnd && rangeEnd < rangeStart)
  ) {
    return false;
  }

  if (!event.is_recurring) {
    return getOccurrenceEnd(start, event) >= rangeStart && (!rangeEnd || start <= rangeEnd);
  }

  const occurrence = getNextOccurrenceStart(event, rangeStart);
  return Boolean(
    occurrence && getOccurrenceEnd(occurrence, event) >= rangeStart && (!rangeEnd || occurrence <= rangeEnd),
  );
};

/** Orders mixed one-off and recurring results by the occurrence a visitor can attend next. */
export const sortEventsByNextOccurrence = <
  T extends {
    end_date?: Date | null | string;
    is_recurring?: boolean;
    recurrence_rule?: null | string;
    start_date: Date | string;
  },
>(
  events: T[],
  from = new Date(),
) =>
  events
    .map((event) => ({ event, time: (getNextOccurrenceStart(event, from) ?? new Date(event.start_date)).getTime() }))
    .sort((left, right) => left.time - right.time)
    .map(({ event }) => event);

/** Returns the last possible occurrence start, or null when a valid series has no end. */
export const getRecurrenceEnd = (
  startDate: Date | string,
  recurrenceRule: null | string | undefined,
): Date | null | undefined => {
  const start = new Date(startDate);
  const rule = parseRecurrenceRule(recurrenceRule);
  if (Number.isNaN(start.getTime()) || !rule) return undefined;

  return getFinalOccurrence(start, rule);
};

/**
 * Finds the instant after which this event must no longer be treated as active.
 * Undefined means invalid date data; null means an intentionally open-ended series.
 */
export const getEventCompletionTime = ({
  end_date,
  is_recurring,
  recurrence_rule,
  start_date,
}: {
  end_date?: Date | null | string;
  is_recurring?: boolean;
  recurrence_rule?: null | string;
  start_date: Date | string;
}): Date | null | undefined => {
  const start = new Date(start_date);
  if (Number.isNaN(start.getTime())) return undefined;

  const end = end_date ? new Date(end_date) : start;
  const occurrenceEnd = Number.isNaN(end.getTime()) || end < start ? start : end;

  if (!is_recurring) return occurrenceEnd;

  const recurrenceEnd = getRecurrenceEnd(start_date, recurrence_rule);
  if (recurrenceEnd === null) return null;
  if (recurrenceEnd === undefined) return occurrenceEnd;

  return new Date(recurrenceEnd.getTime() + Math.max(0, occurrenceEnd.getTime() - start.getTime()));
};

export const isEventScheduleFinished = (event: Parameters<typeof getEventCompletionTime>[0], now = new Date()) => {
  const completionTime = getEventCompletionTime(event);
  return Boolean(completionTime && completionTime.getTime() < now.getTime());
};

export type EventDatePreset = "weekend";

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getEventDatePreset = (
  value: null | string,
  now = new Date(),
): { dateFrom: string; dateTo: string } | undefined => {
  if (value !== "weekend") return undefined;

  const dayOfWeek = now.getDay();
  const daysToFriday = dayOfWeek === 0 ? -2 : dayOfWeek === 6 ? -1 : 5 - dayOfWeek;
  const friday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToFriday);
  const sunday = new Date(friday.getFullYear(), friday.getMonth(), friday.getDate() + 2);

  return {
    dateFrom: toDateInputValue(friday),
    dateTo: toDateInputValue(sunday),
  };
};

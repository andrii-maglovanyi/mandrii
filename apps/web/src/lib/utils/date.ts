import { format, isValid, parse } from "date-fns";

export const formatTime = (time: string) => {
  if (!time) return "";

  // try with seconds first, fallback to without
  let parsed = parse(time, "HH:mm:ss", new Date());
  if (!isValid(parsed)) parsed = parse(time, "HH:mm", new Date());

  return isValid(parsed) ? format(parsed, "HH:mm") : "";
};

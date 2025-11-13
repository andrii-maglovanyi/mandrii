import { constants } from "~/lib/constants";

export type DayOfWeek = (typeof constants.weekdays)[number]["full"]["en"];

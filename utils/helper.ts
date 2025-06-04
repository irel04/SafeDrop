import { format } from "date-fns";

export const getDateTime = (dateStr: string) => {
  const date = new Date(dateStr);

  const dateISO = format(date, "MMMM dd yyyy");

  const timeISO = format(date, "p");

  return { dateISO, timeISO };
};

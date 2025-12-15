import { RecurrencePicker } from "~/components/layout";
import { Checkbox, Input } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { EventSchema } from "~/lib/validation/event";

type EventInfoProps = Pick<FormProps<EventSchema["shape"]>, "getFieldProps" | "setValues" | "values">;

const formatDateForInput = (date: Date | null | string | undefined): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16); // Format: "YYYY-MM-DDTHH:mm"
};

export const EventDate = ({ getFieldProps, setValues, values }: EventInfoProps) => {
  const i18n = useI18n();
  return (
    <>
      <div className={`mb-2 flex grow flex-col gap-4 lg:flex-row`}>
        <div className="flex flex-1 flex-col">
          <Input
            label={i18n("Start date")}
            required
            type="datetime-local"
            {...getFieldProps("start_date")}
            value={formatDateForInput(values.start_date)}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <Input
            label={i18n("End date")}
            type="datetime-local"
            {...getFieldProps("end_date")}
            value={formatDateForInput(values.end_date)}
          />
        </div>
      </div>

      <Checkbox label={i18n("This is a recurring event")} {...getFieldProps("is_recurring")} />

      {values.is_recurring && (
        <div>
          <label className="mb-2 block text-sm font-medium">{i18n("Recurrence pattern")}</label>
          <RecurrencePicker
            onChange={(value) => {
              setValues((prev) => ({
                ...prev,
                recurrence_rule: value,
              }));
            }}
            value={values.recurrence_rule}
          />
        </div>
      )}
    </>
  );
};

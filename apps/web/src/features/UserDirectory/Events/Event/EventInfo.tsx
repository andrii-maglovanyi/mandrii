import { useLocale } from "next-intl";

import { Checkbox, Input, MDEditor, Select } from "~/components/ui";
import { useTheme } from "~/contexts/ThemeContext";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { eventDescriptionMaxCharsCount, EventSchema } from "~/lib/validation/event";
import { Locale, Price_Type_Enum } from "~/types";

type EventInfoProps = Pick<FormProps<EventSchema["shape"]>, "getFieldProps" | "values">;

export const EventInfo = ({ getFieldProps, values }: EventInfoProps) => {
  const { isDark } = useTheme();
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const priceTypeOptions = Object.values(Price_Type_Enum).map((value) => ({
    label: constants.priceTypes[value as keyof typeof constants.priceTypes].label[locale],
    value,
  }));

  const showPriceAmount =
    values.price_type === Price_Type_Enum.Paid || values.price_type === Price_Type_Enum.SuggestedDonation;

  return (
    <>
      <Input
        label={i18n("Organizer name")}
        placeholder="PMK Event Agency"
        type="text"
        {...getFieldProps("organizer_name")}
      />

      <MDEditor
        isDark={isDark}
        label="Опис (🇺🇦 Українською)"
        placeholder="Цей бандуристичний фестиваль просто зриває дах"
        {...getFieldProps("description_uk")}
        maxChars={eventDescriptionMaxCharsCount}
      />

      <MDEditor
        isDark={isDark}
        label="Description (🇬🇧 English)"
        placeholder="This bandura festival is just mind-blowing"
        {...getFieldProps("description_en")}
        maxChars={eventDescriptionMaxCharsCount}
      />

      {/* Price & registration */}
      <div className="border-primary/10 space-y-4 border-t pt-4">
        <h3 className="text-primary text-lg font-medium">{i18n("Price & registration")}</h3>

        <Select label={i18n("Price type")} options={priceTypeOptions} required {...getFieldProps("price_type")} />

        {showPriceAmount && (
          <div className={`flex grow flex-col gap-4 lg:flex-row`}>
            <div className="flex flex-1 flex-col">
              <Input
                label={i18n("Price amount")}
                min={0}
                placeholder="10.00"
                required={showPriceAmount}
                step={0.01}
                type="number"
                {...getFieldProps("price_amount")}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <Input
                label={i18n("Currency")}
                placeholder="EUR"
                required
                type="text"
                {...getFieldProps("price_currency")}
              />
            </div>
          </div>
        )}

        <Checkbox label={i18n("Registration required")} {...getFieldProps("registration_required")} />

        {values.registration_required && (
          <Input
            label={i18n("Registration URL")}
            placeholder="https://eventbrite.com/..."
            type="url"
            {...getFieldProps("registration_url")}
          />
        )}

        <Input label={i18n("Capacity")} min={1} placeholder="100" type="number" {...getFieldProps("capacity")} />
      </div>

      {/* Additional information */}
      <div className="border-primary/10 space-y-4 border-t pt-4">
        <h3 className="text-primary text-lg font-medium">{i18n("Additional Information")}</h3>

        <Input
          label={i18n("Age restriction")}
          placeholder={i18n("18+, Family-friendly, etc.")}
          type="text"
          {...getFieldProps("age_restriction")}
        />

        <MDEditor
          isDark={isDark}
          label={i18n("Accessibility Information")}
          placeholder={i18n("Wheelchair accessible, Sign language interpretation available, etc.")}
          {...getFieldProps("accessibility_info")}
        />
      </div>
    </>
  );
};

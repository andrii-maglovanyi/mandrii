import { useLocale } from "next-intl";

import { Checkbox, Input, MDEditor, Select } from "~/components/ui";
import { useTheme } from "~/contexts/ThemeContext";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { eventDescriptionMaxCharsCount, EventSchema } from "~/lib/validation/event";
import { Locale, Price_Type_Enum } from "~/types";

type EventInfoProps = Pick<FormProps<EventSchema["shape"]>, "getFieldProps" | "setErrors" | "values">;

export const EventInfo = ({ getFieldProps, setErrors, values }: EventInfoProps) => {
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
      <div className={`border-primary/20 bg-primary/5 mb-4 rounded-lg border-2 p-5`}>
        <Select label={i18n("Price type")} options={priceTypeOptions} required {...getFieldProps("price_type")} />

        {showPriceAmount && (
          <div className={`flex grow gap-4 lg:flex-row`}>
            <Input
              className="max-w-80"
              label={i18n("Price amount")}
              min={0}
              placeholder="10.00"
              required={showPriceAmount}
              step={0.01}
              type="number"
              {...getFieldProps("price_amount")}
              onBlur={(e) => {
                getFieldProps("external_url").onBlur();

                // Manually validate since refine won't run until all required fields are filled
                if (!e.target.value?.trim()) {
                  setErrors((prev) => ({
                    ...prev,
                    price_amount: i18n("Price amount is required"),
                  }));
                }
              }}
            />

            <Input
              className="max-w-24"
              label={i18n("Currency")}
              placeholder="EUR"
              required
              type="text"
              {...getFieldProps("price_currency")}
              onBlur={(e) => {
                getFieldProps("price_currency").onBlur();

                // Manually validate since refine won't run until all required fields are filled
                if (!e.target.value?.trim()) {
                  setErrors((prev) => ({
                    ...prev,
                    price_currency: i18n("Currency is required"),
                  }));
                }
              }}
            />
          </div>
        )}
      </div>

      <div className="my-8">
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
      </div>

      <div className={`border-primary/20 bg-primary/5 mb-8 rounded-lg border-2 p-5`}>
        <Checkbox label={i18n("Registration required")} {...getFieldProps("registration_required")} />

        {values.registration_required && (
          <Input
            label={i18n("Registration URL")}
            placeholder="https://eventbrite.com/..."
            type="url"
            {...getFieldProps("registration_url")}
          />
        )}
      </div>

      <Input
        label={i18n("Age restriction")}
        placeholder={i18n("18+, Family-friendly, etc.")}
        type="text"
        {...getFieldProps("age_restriction")}
      />

      <MDEditor
        height={200}
        isDark={isDark}
        label={i18n("Accessibility Information")}
        placeholder={i18n("Wheelchair accessible, Sign language interpretation available, etc.")}
        {...getFieldProps("accessibility_info")}
      />

      <Input
        className="max-w-48"
        label={i18n("Capacity")}
        min={1}
        placeholder="100"
        type="number"
        {...getFieldProps("capacity")}
      />
    </>
  );
};

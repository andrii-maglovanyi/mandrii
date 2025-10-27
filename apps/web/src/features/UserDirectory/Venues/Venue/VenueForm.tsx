"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import slugify from "slugify";

import { FormFooter } from "~/components/layout";
import { Checkbox, Input, Select, TabPane, Tabs } from "~/components/ui";
import { InitialValuesType, OnFormSubmitHandler, useForm } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { getVenueSchema, VenueSchema } from "~/lib/validation/venue";
import { Locale, Status, Venue_Category_Enum } from "~/types";

import { VenueAddress } from "./VenueAddress";
import { VenueContacts } from "./VenueContacts";
import { VenueImages } from "./VenueImages";
import { VenueInfo } from "./VenueInfo";

interface VenueFormProps {
  initialValues?: Partial<InitialValuesType<VenueSchema["shape"]>>;
  onSubmit: OnFormSubmitHandler;
  onSuccess(): void;
  status?: Status;
}

export const VenueForm = ({ initialValues = {}, onSubmit, onSuccess }: VenueFormProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const {
    errors,
    getFieldProps,
    getFieldsProps,
    hasChanges,
    isFormValid,
    resetForm,
    setValues,
    useFormSubmit,
    useImagePreviews,
    values,
  } = useForm({
    initialValues,
    schema: getVenueSchema(i18n),
  });

  const { handleSubmit, status } = useFormSubmit({
    onSubmit,
    onSuccess,
  });

  useEffect(() => {
    if (initialValues.id) return;

    if (values.name) {
      const nameWithArea = values.area ? `${values.name} ${values.area}` : values.name;

      setValues((prev) => ({
        ...prev,
        slug: slugify(nameWithArea, {
          lower: true,
          strict: true,
        }),
      }));
    }
  }, [initialValues.id, setValues, values.name, values.area]);

  const categoryOptions = Object.values(Venue_Category_Enum).map((value) => {
    const { iconName, label } = constants.categories[value as keyof typeof constants.categories];

    return {
      label: (
        <div className="flex items-center gap-3">
          {getIcon(iconName)} {label[locale]}
        </div>
      ),
      value,
    };
  });

  const isBusy = status === "processing";

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className={`
        flex grow flex-col justify-evenly
        lg:flex-row lg:space-x-4
      `}>
        <div className={`
          flex flex-3 flex-col justify-evenly
          md:flex-row md:space-x-4
        `}>
          <div className="flex flex-3 flex-col">
            <Select label={i18n("Category")} options={categoryOptions} required {...getFieldProps("category")} />
          </div>
          <div className="flex flex-4 flex-col">
            <Input label={i18n("Name")} placeholder="Пузата хата" required type="text" {...getFieldProps("name")} />
          </div>
        </div>
        <div className="flex flex-2 flex-col">
          <Input
            label={i18n("Slug")}
            placeholder="puzata-hata-london"
            required
            type="text"
            {...getFieldProps("slug")}
            disabled={isBusy || Boolean(initialValues.id)}
          />
          <p className="mt-1.5 text-sm text-neutral">
            {i18n(
              "↑ The slug serves as a unique identifier for your venue and must be URL-friendly. Once created, it cannot be changed.",
            )}
          </p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-5">
        <Checkbox
          label={i18n("I own this venue")}
          {...getFieldProps("is_owner")}
          disabled={isBusy || Boolean(initialValues.id)}
        />
        <p className="text-sm text-neutral">
          ↑ {i18n("Legal owners have additional management privileges. This setting cannot be changed.")}
        </p>
      </div>

      <p className="mt-8 text-sm">
        {i18n("Optionally, update contacts, a description, photos, a logo, and an address for more details.")}
      </p>

      <Tabs>
        <TabPane tab={i18n("Contacts")}>
          <VenueContacts getFieldProps={getFieldProps} getFieldsProps={getFieldsProps} setValues={setValues} />
        </TabPane>
        <TabPane tab={i18n("Info")}>
          <VenueInfo getFieldProps={getFieldProps} />
        </TabPane>
        <TabPane tab={i18n("Images")}>
          <VenueImages getFieldProps={getFieldProps} setValues={setValues} useImagePreviews={useImagePreviews} />
        </TabPane>
        <TabPane tab={i18n("Address")}>
          <VenueAddress
            errors={errors}
            getFieldProps={getFieldProps}
            isBusy={isBusy}
            setValues={setValues}
            values={values}
          />
        </TabPane>
      </Tabs>

      <FormFooter handleCancel={resetForm} hasChanges={hasChanges} isFormValid={isFormValid} status={status} />
    </form>
  );
};

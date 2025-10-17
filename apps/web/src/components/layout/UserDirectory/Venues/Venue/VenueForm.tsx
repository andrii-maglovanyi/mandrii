"use client";

import { useLocale } from "next-intl";
import { FormEvent, useEffect } from "react";
import slugify from "slugify";
import z from "zod";

import { Alert, Button, Input, Select, TabPane, Tabs } from "~/components/ui";
import { useForm } from "~/hooks/useForm";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { getVenueSchema, VenueFormData } from "~/lib/validation/venue";
import { Locale, Status, Venue_Category_Enum } from "~/types";

import { VenueAddress } from "./VenueAddress";
import { VenueContacts } from "./VenueContacts";
import { VenueImages } from "./VenueImages";
import { VenueInfo } from "./VenueInfo";

interface VenueFormProps {
  initialValues?: Partial<VenueFormData>;
  onSubmit(data: Partial<VenueFormData>): Promise<void | z.ZodError["issues"]>;
  status?: Status;
}

const INITIAL_FORM_VALUES = {
  address: null,
  area: null,
  category: Venue_Category_Enum.BeautySalon,
  city: null,
  country: null,
  description_en: "",
  description_uk: "",
  emails: [""],
  images: [],
  name: "",
  phone_numbers: [""],
  slug: "",
  website: "",
};

export const VenueForm = ({ initialValues = {}, onSubmit, status = "idle" }: VenueFormProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const isBusy = status === "processing";

  const {
    errors,
    getFieldProps,
    getFieldsProps,
    isFormValid,
    setFieldErrorsFromServer,
    setValues,
    validateForm,
    values,
  } = useForm({
    initialValues: { ...INITIAL_FORM_VALUES, ...initialValues },
    schema: getVenueSchema(i18n),
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const errors = await onSubmit(values);
    if (errors) {
      setFieldErrorsFromServer(errors);
    }
  };

  useEffect(() => {
    if (values.name && !initialValues.id) {
      setValues((prev) => ({
        ...prev,
        slug: slugify(`${values.name}${values.area ? ` ${values.area}` : ""}`, {
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

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className={`flex grow flex-col justify-evenly lg:flex-row lg:space-x-4`}>
        <div className={`flex flex-3 flex-col justify-evenly md:flex-row md:space-x-4`}>
          <div className="flex flex-3 flex-col">
            <Select
              disabled={isBusy}
              label={i18n("Category")}
              name="category"
              options={categoryOptions}
              required
              {...getFieldProps("category")}
            />
          </div>
          <div className="flex flex-4 flex-col">
            <Input
              disabled={isBusy}
              label={i18n("Name")}
              name="name"
              placeholder="Пузата хата"
              required
              type="text"
              {...getFieldProps("name")}
            />
          </div>
        </div>
        <div className="flex flex-2 flex-col">
          <Input
            disabled={isBusy || Boolean(initialValues.id)}
            label={i18n("Slug")}
            name="slug"
            placeholder="puzata-hata-london"
            required
            type="text"
            {...getFieldProps("slug")}
          />
        </div>
      </div>

      <p className="text-neutral text-sm">
        {i18n("Optionally, update contacts, a description, photos, a logo, and an address for more details.")}
      </p>

      <Tabs>
        <TabPane tab={i18n("Contacts")}>
          <VenueContacts
            getFieldProps={getFieldProps}
            getFieldsProps={getFieldsProps}
            isBusy={isBusy}
            setValues={setValues}
          />
        </TabPane>
        <TabPane tab={i18n("Info")}>
          <VenueInfo getFieldProps={getFieldProps} isBusy={isBusy} />
        </TabPane>
        <TabPane tab={i18n("Images")}>
          <VenueImages getFieldProps={getFieldProps} isBusy={isBusy} setValues={setValues} values={values} />
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

      <div className={`flex flex-col justify-end space-y-4 space-x-4 py-2 md:flex-row md:items-center md:space-y-0`}>
        {status === "processing" && <Alert variant="info">{i18n("The request may a little time to process...")}</Alert>}
        {status === "success" && (
          <Alert fadeAfter={5000} variant="success">
            {i18n("Thanks for submitting! Your venue has been submitted for review.")}
          </Alert>
        )}
        {status === "error" && <Alert variant="error">{i18n("Failed to submit venue. Please try again.")}</Alert>}

        <Button busy={isBusy} color="primary" disabled={!isFormValid} type="submit">
          {isBusy ? i18n("Saving changes") : i18n("Save changes")}
        </Button>
      </div>
    </form>
  );
};

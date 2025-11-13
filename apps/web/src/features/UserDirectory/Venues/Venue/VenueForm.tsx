"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import slugify from "slugify";

import { FormFooter } from "~/components/layout";
import { Checkbox, Input, RichText, Select, TabPane, Tabs } from "~/components/ui";
import { InitialValuesType, OnFormSubmitHandler, useForm } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { getVenueSchema, VenueSchema } from "~/lib/validation/venue";
import { Locale, Status, Venue_Category_Enum } from "~/types";

import { VenueAccommodationDetails } from "./Metadata/VenueAccommodationDetails";
import { VenueBeautySalonDetails } from "./Metadata/VenueBeautySalonDetails";
import { VenueRestaurantDetails } from "./Metadata/VenueRestaurantDetails";
import { VenueSchedule } from "./Metadata/VenueSchedule";
import { VenueSchoolDetails } from "./Metadata/VenueSchoolDetails";
import { VenueShopDetails } from "./Metadata/VenueShopDetails";
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
    if (initialValues.id || !values.name) return;

    let slugConstructor = values.name;

    if (values.area) {
      slugConstructor = `${slugConstructor} ${values.area?.split(",")[0].trim()}`;
    }

    if (values.category) {
      slugConstructor = `${values.category} ${slugConstructor}`;
    }

    setValues((prev) => ({
      ...prev,
      slug: slugify(slugConstructor, {
        lower: true,
        strict: true,
      }),
    }));
  }, [initialValues.id, setValues, values.name, values.area, values.category]);

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

  const hasOperatingHours =
    values.category &&
    [
      Venue_Category_Enum.BeautySalon,
      Venue_Category_Enum.Cafe,
      Venue_Category_Enum.CulturalCentre,
      Venue_Category_Enum.DentalClinic,
      Venue_Category_Enum.GroceryStore,
      Venue_Category_Enum.Library,
      Venue_Category_Enum.Restaurant,
      Venue_Category_Enum.School,
      Venue_Category_Enum.Shop,
    ].includes(values.category);

  const isAccommodation = values.category === Venue_Category_Enum.Accommodation;
  const isRestaurantOrCafe =
    values.category === Venue_Category_Enum.Restaurant || values.category === Venue_Category_Enum.Cafe;
  const isShop = values.category === Venue_Category_Enum.Shop || values.category === Venue_Category_Enum.GroceryStore;
  const isSchool = values.category === Venue_Category_Enum.School;
  const isBeautySalon = values.category === Venue_Category_Enum.BeautySalon;

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
            <Select
              label={i18n("Category")}
              options={categoryOptions}
              required
              {...getFieldProps("category")}
              disabled={isBusy || Boolean(initialValues.id)}
            />
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
          <RichText as="p" className="mt-1.5 text-sm text-neutral">
            {i18n(
              "↑ This is the unique identifier which must be URL-friendly and **at least 10 characters long**. Once created, it cannot be changed.",
            )}
          </RichText>
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
        {i18n("Optionally, update contacts, a description, photos, details, and an address for more information.")}
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

        {hasOperatingHours && (
          <TabPane tab={i18n("Opening hours")}>
            <VenueSchedule getFieldProps={getFieldProps} setValues={setValues} values={values} />
          </TabPane>
        )}
        {isAccommodation && (
          <TabPane tab={i18n("Details")}>
            <VenueAccommodationDetails setValues={setValues} values={values} />
          </TabPane>
        )}
        {isRestaurantOrCafe && (
          <TabPane tab={i18n("Details")}>
            <VenueRestaurantDetails setValues={setValues} values={values} />
          </TabPane>
        )}
        {isShop && (
          <TabPane tab={i18n("Details")}>
            <VenueShopDetails setValues={setValues} values={values} />
          </TabPane>
        )}
        {isSchool && (
          <TabPane tab={i18n("Details")}>
            <VenueSchoolDetails setValues={setValues} values={values} />
          </TabPane>
        )}
        {isBeautySalon && (
          <TabPane tab={i18n("Details")}>
            <VenueBeautySalonDetails setValues={setValues} values={values} />
          </TabPane>
        )}
      </Tabs>

      <FormFooter handleCancel={resetForm} hasChanges={hasChanges} isFormValid={isFormValid} status={status} />
    </form>
  );
};

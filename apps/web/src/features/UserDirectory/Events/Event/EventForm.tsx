"use client";

import { useLocale } from "next-intl";
import { useEffect, useMemo } from "react";
import slugify from "slugify";

import { FormFooter } from "~/components/layout";
import { Input, Select, TabPane, Tabs } from "~/components/ui";
import { InitialValuesType, OnFormSubmitHandler, useForm } from "~/hooks/form/useForm";
import { useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { EventSchema, getEventSchema } from "~/lib/validation/event";
import { Event_Type_Enum, Locale, Status, Venue_Status_Enum } from "~/types";

import { EventContacts } from "./EventContacts";
import { EventDate } from "./EventDate";
import { EventImages } from "./EventImages";
import { EventInfo } from "./EventInfo";
import { EventLocation } from "./EventLocation";

interface EventFormProps {
  initialValues?: Partial<InitialValuesType<EventSchema["shape"]>>;
  onSubmit: OnFormSubmitHandler;
  onSuccess(): void;
  status?: Status;
}

export const EventForm = ({ initialValues = {}, onSubmit, onSuccess }: EventFormProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { usePublicVenues } = useVenues();

  // Fetch all active venues for the dropdown
  const { data: venues, loading: venuesLoading } = usePublicVenues({
    limit: 1000,
    order_by: [{ name: "asc" }],
    where: {
      status: { _eq: Venue_Status_Enum.Active },
    },
  });

  const {
    errors,
    getFieldProps,
    hasChanges,
    isFormValid,
    resetForm,
    setValues,
    useFormSubmit,
    useImagePreviews,
    values,
  } = useForm({
    initialValues,
    schema: getEventSchema(i18n),
  });

  const { handleSubmit, status } = useFormSubmit({
    onSubmit,
    onSuccess,
  });

  useEffect(() => {
    const title = values.title_uk ?? values.title_en;

    if (initialValues.id || !title) return;

    let titleWithSuffix = title;

    // If venue is selected, append venue slug
    if (values.venue_id && venues) {
      const selectedVenue = venues.find((v) => v.id === values.venue_id);
      if (selectedVenue?.slug) {
        titleWithSuffix = `${titleWithSuffix} ${selectedVenue.slug}`;
      }
    }
    // If custom location with area, append area (like venues do)
    else if (values.area && !values.venue_id) {
      titleWithSuffix = `${titleWithSuffix} ${values.area}`;
    }

    setValues((prev) => ({
      ...prev,
      slug: slugify(titleWithSuffix, {
        lower: true,
        strict: true,
      }),
    }));
  }, [initialValues.id, setValues, values.title_en, values.title_uk, values.area, values.venue_id, venues]);

  const eventTypeOptions = Object.values(Event_Type_Enum).map((value) => {
    const { iconName, label } = constants.eventTypes[value as keyof typeof constants.eventTypes];

    return {
      label: (
        <div className="flex items-center gap-3">
          {getIcon(iconName)} {label[locale]}
        </div>
      ),
      value,
    };
  });

  // Venue dropdown options
  const venueOptions = useMemo(() => {
    if (!venues) return [{ label: i18n("No venue (custom location)"), value: "" }];

    return [
      { label: i18n("No venue (custom location)"), value: "" },
      ...venues.map((venue) => ({
        label: `${venue.name}${venue.city ? ` - ${venue.city}` : ""}`,
        value: venue.id,
      })),
    ];
  }, [venues, i18n]);

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
            <Select label={i18n("Event type")} options={eventTypeOptions} required {...getFieldProps("type")} />
          </div>
          <div className="flex flex-4 flex-col">
            <Input
              label={"Назва події (🇺🇦 Українською)"}
              placeholder={"Український фестиваль 2026"}
              required
              type="text"
              {...getFieldProps("title_uk")}
            />
            <Input
              label={"Event title (🇬🇧 English)"}
              placeholder={"Ukrainian Festival 2026"}
              required
              type="text"
              {...getFieldProps("title_en")}
            />
          </div>
        </div>
        <div className="flex flex-2 flex-col">
          <Input
            disabled={isBusy || Boolean(initialValues.id)}
            label={i18n("Slug")}
            placeholder="ukrainian-festival-2025"
            required
            type="text"
            {...getFieldProps("slug")}
          />
          <p className="mt-1.5 text-sm text-neutral">
            {i18n(
              "↑ The slug serves as a unique identifier for your event and must be URL-friendly. Once created, it cannot be changed.",
            )}
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm">
        {i18n("Add location, date & time, descriptions, images, and other information below.")}
      </p>

      <Tabs>
        <TabPane tab={i18n("Location")}>
          <EventLocation
            errors={errors}
            getFieldProps={getFieldProps}
            isBusy={isBusy}
            setValues={setValues}
            values={values}
            venueOptions={venueOptions}
            venuesLoading={venuesLoading}
          />
        </TabPane>
        <TabPane tab={i18n("Info")}>
          <EventInfo getFieldProps={getFieldProps} values={values} />
        </TabPane>
        <TabPane tab={i18n("Date & Time")}>
          <EventDate getFieldProps={getFieldProps} setValues={setValues} values={values} />
        </TabPane>
        <TabPane tab={i18n("Contacts")}>
          <EventContacts getFieldProps={getFieldProps} />
        </TabPane>
        <TabPane tab={i18n("Images")}>
          <EventImages getFieldProps={getFieldProps} setValues={setValues} useImagePreviews={useImagePreviews} />
        </TabPane>
      </Tabs>

      <FormFooter handleCancel={resetForm} hasChanges={hasChanges} isFormValid={isFormValid} status={status} />
    </form>
  );
};

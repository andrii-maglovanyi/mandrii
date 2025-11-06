import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert, Button, Checkbox, Input, RichText, Select, Separator, Textarea } from "~/components/ui";
import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";
import { useTheme } from "~/contexts/ThemeContext";
import { PinMap } from "~/features/Events/Map/PinMap";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { getLatitudeBounds, getLongitudeBounds } from "~/lib/utils";
import { EventSchema } from "~/lib/validation/event";

import { useGeocode } from "../../Venues/Venue/hooks";

interface EventLocationProps
  extends Pick<FormProps<EventSchema["shape"]>, "errors" | "getFieldProps" | "setValues" | "values"> {
  isBusy: boolean;
  venueOptions: Array<{ label: string; value: string }>;
  venuesLoading: boolean;
}

interface Geocode {
  address: string;
  area: string;
  city: string;
  coordinates: [number, number];
  country: string;
  postcode: string;
}

export const EventLocation = ({
  errors,
  getFieldProps,
  isBusy,
  setValues,
  values,
  venueOptions,
  venuesLoading,
}: EventLocationProps) => {
  const i18n = useI18n();
  const { isDark } = useTheme();
  const { data, error: isAddressError, execute, loading: isAddressLoading } = useGeocode<Geocode>();

  const initialAddress = useMemo(
    () =>
      values.custom_location_address && values.longitude && values.latitude
        ? {
            address: values.custom_location_address,
            coordinates: [+Number(values.longitude).toFixed(5), +Number(values.latitude).toFixed(5)],
          }
        : null,
    [values.custom_location_address, values.longitude, values.latitude],
  );

  const [fullAddress, setFullAddress] = useState(initialAddress);

  const bounds = useMemo(() => {
    if (!fullAddress?.coordinates) return null;

    const [lng, lat] = fullAddress.coordinates;

    return {
      latitude: getLatitudeBounds(lat),
      longitude: getLongitudeBounds(lat, lng),
    };
  }, [fullAddress?.coordinates]);

  useEffect(() => {
    if (data) {
      setValues((prev) => ({
        ...prev,
        area: data.area,
        city: data.city,
        country: data.country,
      }));
      setFullAddress(data);
    }
  }, [data, setValues]);

  const resetCoordinates = useCallback(() => {
    if (fullAddress?.coordinates) {
      const [longitude, latitude] = fullAddress.coordinates;

      setValues((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
    }
  }, [setValues, fullAddress]);

  useEffect(() => {
    resetCoordinates();
  }, [fullAddress, resetCoordinates]);

  const handleVerifyAddress = useCallback(() => {
    if (values.custom_location_address) {
      const payload = JSON.stringify({
        address: values.custom_location_address,
        is_physical: true, // Events are always physical if using custom location
      });
      execute(payload);
    }
  }, [values.custom_location_address, execute]);

  const hasVerifiedAddress =
    fullAddress?.coordinates && !isAddressLoading && values.longitude !== undefined && values.latitude !== undefined;

  const isVerifyDisabled = !values.custom_location_address || !!errors.custom_location_address || isAddressLoading;

  const showCustomLocation = !values.venue_id && !values.is_online;

  return (
    <>
      <RichText as="div" className="py-6 text-sm text-neutral">
        {i18n("Choose at least one: mark as online event, select a venue, or enter a custom location")}
      </RichText>

      <Checkbox label={i18n("This is an online event")} {...getFieldProps("is_online")} />

      {values.is_online && (
        <Input
          disabled={isBusy}
          label={i18n("Online event URL")}
          placeholder="https://zoom.us/j/..."
          type="url"
          {...getFieldProps("external_url")}
        />
      )}

      <Select
        disabled={venuesLoading || isBusy}
        label={i18n("Venue")}
        options={venueOptions}
        placeholder={i18n("Select a venue...")}
        {...getFieldProps("venue_id")}
        value={values.venue_id || ""}
      />

      {showCustomLocation && (
        <>
          <Separator className="my-4" />
          <RichText as="div" className="py-6 text-sm text-neutral">
            {i18n(
              "**Enter a custom location** if the event isn't at a registered venue. Provide the full address for accurate map placement.",
            )}
          </RichText>

          <Input
            disabled={isBusy}
            label={i18n("Location name")}
            placeholder={i18n("Community Center, Conference Hall A")}
            type="text"
            {...getFieldProps("custom_location_name")}
          />

          <div className={`
            flex flex-col
            md:flex-row md:space-x-4
          `}>
            <div className="flex grow flex-col">
              <Input
                disabled={isBusy || isAddressLoading}
                label={i18n("Address")}
                placeholder="10 Oxford St, London W1D 1AW"
                type="text"
                {...getFieldProps("custom_location_address")}
              />
            </div>
            <div className={`
              flex flex-col
              md:pt-6
            `}>
              <Button
                busy={isAddressLoading}
                disabled={isVerifyDisabled}
                onClick={handleVerifyAddress}
                variant="filled"
              >
                {isAddressLoading ? i18n("Verifying address") : i18n("Verify address")}
              </Button>
            </div>
          </div>

          {isAddressError && (
            <Alert className="mt-2" dismissLabel={i18n("Dismiss alert")}>
              {isAddressError}
            </Alert>
          )}

          {isAddressLoading && (
            <div className={`
              flex h-max min-h-96 flex-1 items-center justify-center
            `}>
              <AnimatedEllipsis centered size="lg" />
            </div>
          )}

          {hasVerifiedAddress && !isAddressError && (
            <>
              <Alert className={`
                mt-8
                md:mt-2
              `} variant="success">
                {fullAddress.address}
              </Alert>
              <div className="relative my-4 h-96 overflow-hidden rounded-2xl">
                <PinMap
                  colorScheme={isDark ? "DARK" : "LIGHT"}
                  distance={100}
                  showMe={true}
                  userLocation={{ lat: Number(values.latitude), lng: Number(values.longitude) }}
                  zoom={18}
                />
              </div>

              <RichText as="div" className="py-6 text-sm text-neutral">
                {i18n(
                  "Please make sure the pin location on the map points to the right place.<br />You can adjust coordinates within 100m radius from the original point if it's not quite right",
                )}
              </RichText>

              <div className={`
                flex w-full flex-col
                md:flex-row md:space-x-4
              `}>
                <Input
                  label={`${i18n("Latitude")} (${i18n("orig.")} ${fullAddress.coordinates[1]})`}
                  max={bounds?.latitude.maxLat}
                  min={bounds?.latitude.minLat}
                  placeholder="51.51653"
                  step="0.00001"
                  type="number"
                  {...getFieldProps("latitude")}
                />

                <Input
                  label={`${i18n("Longitude")} (${i18n("orig.")} ${fullAddress.coordinates[0]})`}
                  max={bounds?.longitude.maxLng}
                  min={bounds?.longitude.minLng}
                  placeholder="-0.13090"
                  step="0.00001"
                  type="number"
                  {...getFieldProps("longitude")}
                />

                <Button className="md:mt-6" onClick={resetCoordinates} variant="outlined">
                  <RotateCcw className="mr-2" /> {i18n("Reset coordinates to original")}
                </Button>
              </div>

              <Separator className="my-4" />

              <div>
                <Textarea
                  disabled={isBusy}
                  label={i18n("Searchable event location details")}
                  placeholder="Community Center, 10 Oxford St, London W1D 1AW, United Kingdom"
                  rows={3}
                  {...getFieldProps("area")}
                />

                <p className="text-sm text-neutral">
                  {i18n(
                    "These details are collected automatically and will help users find your event. You can adjust them if needed.",
                  )}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

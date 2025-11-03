import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert, Button, Checkbox, Input, RichText, Separator, Textarea } from "~/components/ui";
import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";
import { useTheme } from "~/contexts/ThemeContext";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { getLatitudeBounds, getLongitudeBounds } from "~/lib/utils";
import { VenueSchema } from "~/lib/validation/venue";

import { VenuesMap } from "../../../Venues/VenuesMap";
import { useGeocode } from "./hooks";

interface Geocode {
  address: string;
  area: string;
  city: string;
  coordinates: [number, number];
  country: string;
  postcode: string;
}

interface VenueAddressProps
  extends Pick<FormProps<VenueSchema["shape"]>, "errors" | "getFieldProps" | "setValues" | "values"> {
  isBusy: boolean;
}

export const VenueAddress = ({ errors, getFieldProps, isBusy, setValues, values }: VenueAddressProps) => {
  const i18n = useI18n();
  const { isDark } = useTheme();
  const { data, error: isAddressError, execute, loading: isAddressLoading } = useGeocode<Geocode>();

  const initialAddress = useMemo(
    () =>
      values.address && values.longitude && values.latitude
        ? {
            address: values.address,
            coordinates: [+Number(values.longitude).toFixed(5), +Number(values.latitude).toFixed(5)],
          }
        : null,
    [values.address, values.longitude, values.latitude],
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
    if (values.address) {
      const payload = JSON.stringify({
        address: values.address,
        is_physical: values.is_physical,
      });
      execute(payload);
    }
  }, [values.address, values.is_physical, execute]);

  const hasVerifiedAddress =
    fullAddress?.coordinates && !isAddressLoading && values.longitude !== undefined && values.latitude !== undefined;

  const isVerifyDisabled = !values.address || !!errors.address || isAddressLoading;

  return (
    <>
      <RichText as="div" className="py-6 text-sm text-neutral">
        {i18n(
          `Adding an address helps users find your venue on the [interactive map]({map_link}) and search by location.`,
          {
            map_link: "/map",
          },
        )}
      </RichText>

      <Checkbox label={i18n("Has a physical location")} {...getFieldProps("is_physical")} disabled={isBusy} />

      {values.is_physical ? (
        <RichText as="div" className="pb-6 text-sm text-neutral">
          {i18n(`**Enter a complete address** (e.g., "10 Oxford St, London W1D 1AW") for accurate map placement.
After verification, you can fine-tune the pin location within a 100m radius if needed.`)}
        </RichText>
      ) : (
        <RichText as="div" className="pb-6 text-sm text-neutral">
          {i18n(`**Enter a general area** (e.g., "Greenwich, London") and your venue won't appear on the map. 
 It will still be discoverable in search by name or by region without showing an exact pin`)}
        </RichText>
      )}

      <div className={`
        flex flex-col
        md:flex-row md:space-x-4
      `}>
        <div className="flex grow flex-col">
          <Input
            className="w-96"
            disabled={isBusy || isAddressLoading}
            label={i18n("Address")}
            placeholder="10 Oxford St, London W1D 1AW"
            type="text"
            {...getFieldProps("address")}
          />
        </div>
        <div className={`
          flex flex-col
          md:pt-6
        `}>
          <Button busy={isAddressLoading} disabled={isVerifyDisabled} onClick={handleVerifyAddress} variant="filled">
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
        <div className="flex h-max min-h-96 flex-1 items-center justify-center">
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
            <VenuesMap
              colorScheme={isDark ? "DARK" : "LIGHT"}
              distance={100}
              showMe={Boolean(values.is_physical)}
              userLocation={{ lat: Number(values.latitude), lng: Number(values.longitude) }}
              zoom={Boolean(values.is_physical) ? 18 : 14}
            />
          </div>

          {values.is_physical ? (
            <>
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
            </>
          ) : null}
          <Separator className="my-4" />
          <div>
            <Textarea
              disabled={isBusy}
              label={i18n("Searchable venue details")}
              placeholder="Puzata Hata, 10 Oxford St, London W1D 1AW, United Kingdom"
              rows={3}
              {...getFieldProps("area")}
            />

            <p className="text-sm text-neutral">
              {i18n(
                "These details are collected automatically and will help users find your venue. You can adjust them if needed.",
              )}
            </p>
          </div>
        </>
      )}
    </>
  );
};

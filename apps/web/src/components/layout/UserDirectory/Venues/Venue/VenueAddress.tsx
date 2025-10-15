import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert, Button, Input, RichText } from "~/components/ui";
import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";
import { useTheme } from "~/contexts/ThemeContext";
import { FormProps } from "~/hooks/useForm";
import { useI18n } from "~/i18n/useI18n";
import { getLatitudeBounds, getLongitudeBounds } from "~/lib/utils";
import { VenueSchema } from "~/lib/validation/venue";
import { ColorVariant } from "~/types";

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
      execute(values.address);
    }
  }, [values.address, execute]);

  const hasVerifiedAddress =
    fullAddress?.coordinates && !isAddressLoading && values.longitude !== undefined && values.latitude !== undefined;

  const isVerifyDisabled = !values.address || !!errors.address || isAddressLoading;

  return (
    <>
      <RichText as="p" className="py-6 text-sm text-neutral">
        {i18n(
          "If you provide an address, it will appear on the [interactive map]({map_link}), where users can find it nearby or search within a specified area.<br/>The address and location won't be saved unless you verify the address.",
          {
            map_link: "/map",
          },
        )}
      </RichText>

      <div className={`
        flex flex-col
        md:flex-row md:space-x-4
      `}>
        <div className="flex grow flex-col">
          <Input
            className="w-96"
            disabled={isBusy || isAddressLoading}
            label={i18n("Address")}
            name="address"
            placeholder="10 Oxford St, London W1D 1AW"
            type="text"
            {...getFieldProps("address")}
          />
        </div>
        <div className={`
          flex flex-col
          md:pt-6
        `}>
          <Button disabled={isVerifyDisabled} onClick={handleVerifyAddress} variant="filled">
            {i18n("Verify address")}
          </Button>
        </div>
      </div>

      {isAddressError && (
        <Alert className="mt-2" dismissLabel={i18n("Dismiss alert")}>
          {i18n("Can not find the address, please correct it and try again")}
        </Alert>
      )}

      {isAddressLoading && <AnimatedEllipsis centered size="lg" />}

      {hasVerifiedAddress && (
        <>
          <Alert className={`
            mt-8
            md:mt-2
          `} variant={ColorVariant.Success}>
            {fullAddress.address}
          </Alert>

          <div className="relative my-4 h-96 overflow-hidden rounded-2xl">
            <VenuesMap
              colorScheme={isDark ? "DARK" : "LIGHT"}
              distance={100}
              showMe={true}
              userLocation={{ lat: Number(values.latitude), lng: Number(values.longitude) }}
            />
          </div>

          <RichText as="p" className="py-6 text-sm text-neutral">
            {i18n(
              "Please make sure the pin location on the map points to the right place.<br />You can adjust coordinates within 100m radius from the original point if it's not quite right",
            )}
          </RichText>
          <div className={`
            flex w-full flex-col
            md:flex-row md:space-x-4
          `}>
            <Input
              disabled={isBusy}
              label={`${i18n("Latitude")} (${i18n("orig.")} ${fullAddress.coordinates[1]})`}
              max={bounds?.latitude.maxLat}
              min={bounds?.latitude.minLat}
              name="latitude"
              placeholder="51.51653"
              step="0.00001"
              type="number"
              {...getFieldProps("latitude")}
            />

            <Input
              disabled={isBusy}
              label={`${i18n("Longitude")} (${i18n("orig.")} ${fullAddress.coordinates[0]})`}
              max={bounds?.longitude.maxLng}
              min={bounds?.longitude.minLng}
              name="longitude"
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
      )}
    </>
  );
};

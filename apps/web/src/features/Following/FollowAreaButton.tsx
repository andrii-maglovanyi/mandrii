"use client";

import { Bell, MapPin } from "lucide-react";
import { useRef, useState } from "react";

import { ActionButton, Button, LocationAutocomplete, Modal, Select } from "~/components/ui";
import {
  createLocationPlaceDetails,
  type LocationPlaceDetails,
} from "~/components/ui/LocationAutocomplete/LocationAutocomplete";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import type { AreaSubscriptionTarget } from "~/lib/content-subscriptions/types";
import { AddEntityButton } from "~/features/shared/AddEntityButton";
import { clsx } from "clsx";

const radiusOptions = [1, 2, 3, 5, 10, 25, 50, 100].map((kilometres) => ({
  label: `${kilometres} km`,
  value: kilometres,
}));

const asAreaTarget = (place: LocationPlaceDetails): AreaSubscriptionTarget | null => {
  if (!place.country || place.latitude === undefined || place.longitude === undefined) return null;

  return {
    country: place.country,
    label: place.location,
    latitude: place.latitude,
    longitude: place.longitude,
    placeId: place.placeId,
    radiusMeters: 10_000,
  };
};

type FollowAreaButtonProps = {
  authenticated?: boolean;
  className?: string;
  disabled?: boolean;
  mapArea?: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
  onSaved?: () => void;
  presentation?: "action" | "add" | "button";
  size?: "lg" | "md" | "sm";
  variant?: "filled" | "outlined";
};

type ReverseGeocodeResult = {
  address: string;
  country: string;
  placeId: null | string;
};

/** One Google-place picker for every area follow entry point. */
export const FollowAreaButton = ({
  authenticated,
  className,
  disabled = false,
  mapArea,
  onSaved,
  presentation = "button",
  size = "md",
  variant = "outlined",
}: FollowAreaButtonProps) => {
  const i18n = useI18n();
  const { isAuthenticated, isLoading } = useUser();
  const canFollow = authenticated ?? isAuthenticated;
  const isWaitingForAuthentication = authenticated === undefined && isLoading;
  const { showError, showSuccess } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<AreaSubscriptionTarget | null>(null);
  const [search, setSearch] = useState("");
  const [radiusMeters, setRadiusMeters] = useState(10_000);
  const [usesMapArea, setUsesMapArea] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isOpenRef = useRef(false);

  const close = () => {
    if (isSaving) return;
    isOpenRef.current = false;
    setIsOpen(false);
    setTarget(null);
    setSearch("");
    setRadiusMeters(10_000);
    setUsesMapArea(false);
  };

  const save = async (targetToSave: AreaSubscriptionTarget | null = target) => {
    if (!targetToSave || isSaving) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/following", {
        body: JSON.stringify({ scope: "area", target: targetToSave }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "Unable to follow this area");
      }
      isOpenRef.current = false;
      setIsOpen(false);
      setTarget(null);
      setSearch("");
      setRadiusMeters(10_000);
      setUsesMapArea(false);
      onSaved?.();
      showSuccess(i18n("Area follow saved"));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to follow this area"));
    } finally {
      setIsSaving(false);
    }
  };

  const open = async () => {
    if (disabled || isWaitingForAuthentication || !canFollow || isPreparing || isSaving) return;

    if (presentation === "action" && mapArea) {
      isOpenRef.current = true;
      setIsPreparing(true);
      setTarget(null);
      setSearch("");
      setRadiusMeters(mapArea.radiusMeters);
      setUsesMapArea(false);
      try {
        const response = await fetch("/api/geocode", {
          body: JSON.stringify({ latitude: mapArea.latitude, longitude: mapArea.longitude }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const place = (await response.json()) as ReverseGeocodeResult;
        if (!response.ok) throw new Error();
        const areaTarget =
          place.address && place.country && place.placeId
            ? asAreaTarget(
                createLocationPlaceDetails({
                  country: place.country,
                  formattedAddress: place.address,
                  latitude: mapArea.latitude,
                  longitude: mapArea.longitude,
                  placeId: place.placeId,
                }),
              )
            : null;

        if (!areaTarget) {
          showError(i18n("Choose a location from the suggestions."));
        } else {
          const mapTarget = { ...areaTarget, radiusMeters: mapArea.radiusMeters };
          setTarget(mapTarget);
          setSearch(mapTarget.label);
          setUsesMapArea(true);
        }
      } catch {
        showError(i18n("Choose a location from the suggestions."));
      } finally {
        setIsPreparing(false);
      }
      setIsOpen(true);
      return;
    }

    isOpenRef.current = true;
    setTarget(null);
    setSearch("");
    setRadiusMeters(10_000);
    setUsesMapArea(false);
    setIsOpen(true);
  };

  if (isWaitingForAuthentication || !canFollow) return null;

  const renderFollowAreaButton = () => {
    if (presentation === "action") {
      return (
        <ActionButton
          aria-label={i18n("Follow this area")}
          busy={isPreparing || isSaving}
          className={className}
          color="neutral"
          tooltipPosition="bottom-start"
          disabled={disabled}
          icon={<Bell aria-hidden size={20} />}
          onClick={() => void open()}
          size={size}
          variant="ghost"
        />
      );
    }

    if (presentation === "add") {
      return (
        <AddEntityButton
          className="ml-auto"
          isAuthenticated={isAuthenticated}
          label={i18n("Follow new area")}
          onClick={open}
          signInLabel={i18n("Sign in to follow")}
        />
      );
    }

    return (
      <Button
        className={clsx(className, "gap-2")}
        color="primary"
        disabled={disabled}
        onClick={open}
        size={size}
        variant={variant}
      >
        <Bell aria-hidden size={20} /> {i18n("Follow new area")}
      </Button>
    );
  };

  return (
    <>
      {renderFollowAreaButton()}

      <Modal className="mb-0" isOpen={isOpen} onClose={close} scrollable title={i18n("Follow an area")}>
        <div className="space-y-5">
          <p className="text-neutral">
            {usesMapArea
              ? i18n("Use the selected map area, or choose another place below.")
              : i18n("Choose a place from the suggestions, then set the distance around it.")}
          </p>

          <LocationAutocomplete
            label={i18n("Location")}
            onChange={(event) => {
              setSearch(event.target.value);
              setTarget(null);
              setUsesMapArea(false);
            }}
            onPlaceDetailsSelect={(place) => {
              if (!isOpenRef.current) return;
              const areaTarget = asAreaTarget(place);
              if (!areaTarget) {
                showError(i18n("Choose a location from the suggestions."));
                return;
              }
              setSearch(areaTarget.label);
              setTarget({ ...areaTarget, radiusMeters });
              setUsesMapArea(false);
            }}
            placeholder={i18n("Search for a city, district or address")}
            required
            value={search}
          />
          <Select
            label={i18n("Distance")}
            onChange={(event) => {
              const nextRadiusMeters = Number(event.target.value) * 1000;
              setRadiusMeters(nextRadiusMeters);
              setTarget((current) => (current ? { ...current, radiusMeters: nextRadiusMeters } : current));
            }}
            options={radiusOptions}
            value={radiusMeters / 1000}
          />
          {usesMapArea && target && (
            <p className="bg-primary/10 text-primary rounded-md px-3 py-2 text-sm">
              <MapPin aria-hidden className="mr-2 inline" size={16} />
              {target.label} - {target.radiusMeters / 1000} km
            </p>
          )}

          <div className="flex justify-end gap-3 pt-5">
            <Button color="neutral" onClick={close} variant="ghost">
              {i18n("Cancel")}
            </Button>

            <Button busy={isSaving} color="primary" disabled={!target} onClick={() => void save()}>
              {i18n("Follow area")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

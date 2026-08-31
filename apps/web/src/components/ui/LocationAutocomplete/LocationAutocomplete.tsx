"use client";

import { Libraries, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useRef, useState } from "react";

import { publicConfig } from "~/lib/config/public";
import { constants } from "~/lib/constants";

import { Input, type InputProps } from "../Input/Input";

const libraries = ["marker", "places"] as Libraries;

type LocationAutocompleteProps = Omit<
  InputProps<string, string>,
  "onFocus" | "onSelectSuggestion" | "suggestions" | "type"
> & {
  includedRegionCodes?: string[];
  onPlaceDetailsSelect?: (place: { country?: string; location: string }) => void;
  onLocationSelect?: (location: string) => void;
};

/**
 * Google Places-powered location input that still works as a normal text field
 * when the Maps API is unavailable.
 */
export const LocationAutocomplete = ({
  includedRegionCodes,
  onChange,
  onPlaceDetailsSelect,
  onLocationSelect,
  ...inputProps
}: Readonly<LocationAutocompleteProps>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: publicConfig.maps.apiKey,
    id: "google-map-script",
    libraries,
  });

  const createSessionToken = useCallback(() => {
    if (isLoaded && !sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || searchTerm.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const result = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          includedRegionCodes: includedRegionCodes ?? Object.keys(constants.whitelisted_countries),
          input: searchTerm,
          sessionToken: sessionTokenRef.current ?? undefined,
        });
        setSuggestions(result.suggestions.filter((suggestion) => suggestion.placePrediction !== null));
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [includedRegionCodes, isLoaded, searchTerm]);

  const handleSuggestionSelect = useCallback(
    async (placeId: string) => {
      const suggestion = suggestions.find((item) => item.placePrediction?.placeId === placeId);
      const fallback = suggestion?.placePrediction?.text.text;
      setSuggestions([]);

      if (fallback) onLocationSelect?.(fallback);

      if (!suggestion?.placePrediction || !onPlaceDetailsSelect) return;

      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({ fields: ["addressComponents", "formattedAddress"] });
        const country =
          place.addressComponents?.find((component) => component.types.includes("country"))?.longText ?? undefined;
        const formattedAddress = place.formattedAddress ?? fallback ?? "";
        if (!formattedAddress) return;
        const countrySuffix = country ? `, ${country}` : "";
        const location =
          countrySuffix && formattedAddress.endsWith(countrySuffix)
            ? formattedAddress.slice(0, -countrySuffix.length)
            : formattedAddress;
        onPlaceDetailsSelect({ country, location });
      } catch {
        // The normal input behaviour remains available if place details cannot be loaded.
      }
    },
    [onLocationSelect, onPlaceDetailsSelect, suggestions],
  );

  return (
    <Input
      {...inputProps}
      onChange={(event) => {
        setSearchTerm(event.target.value);
        onChange?.(event);
      }}
      onFocus={createSessionToken}
      onSelectSuggestion={(placeId) => void handleSuggestionSelect(placeId)}
      suggestions={suggestions.map((suggestion) => ({
        label: suggestion.placePrediction!.text.text,
        value: suggestion.placePrediction!.placeId,
      }))}
      type="search"
    />
  );
};

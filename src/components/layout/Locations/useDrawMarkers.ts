import { useEffect } from "react";

import { sendToMixpanel } from "~/lib/mixpanel";
import { GetPublicLocationsQuery, Location_Status_Enum, Locations } from "~/types";
import { UUID } from "~/types/uuid";

import { COLOR_STYLES } from "./constants";

type AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;

interface AttachMarkerHandlersParams {
  advancedMarker: AdvancedMarkerElement;
  arrowDiv: HTMLDivElement;
  id: UUID;
  isSelected: boolean;
  labelSpan: HTMLSpanElement;
  name: string;
  onLocationSelected: (id: UUID) => void;
  status: Locations["status"];
  STYLES: typeof COLOR_STYLES.LIGHT;
}

type Props = {
  colorScheme: "DARK" | "LIGHT";
  isLoaded: boolean;
  labelSpansRef: React.RefObject<Map<number | string, HTMLSpanElement>>;
  locations: GetPublicLocationsQuery["locations"];
  mapRef: React.RefObject<google.maps.Map | null>;
  markersRef: React.RefObject<Map<UUID, AdvancedMarkerElement>>;
  onLocationSelected: (id: UUID) => void;
  selectedLocationId: null | UUID;
};

export function useDrawMarkers(props: Props) {
  useEffect(() => {
    if (!props.isLoaded) return;
    const STYLES = COLOR_STYLES[props.colorScheme];
    setTimeout(() => drawMarkers(props, STYLES));
  }, [props]);
}

function attachMarkerHandlers({
  advancedMarker,
  arrowDiv,
  id,
  isSelected,
  labelSpan,
  name,
  onLocationSelected,
  status,
  STYLES,
}: AttachMarkerHandlersParams) {
  labelSpan.onmouseover = () => {
    if (!isSelected && status !== Location_Status_Enum.Pending) {
      labelSpan.style.backgroundColor = STYLES.bgHover;
      arrowDiv.style.borderTop = `4px solid ${STYLES.bgHover}`;
      advancedMarker.style.zIndex = "3";
    }
  };
  labelSpan.onmouseout = () => {
    if (!isSelected) {
      labelSpan.style.backgroundColor = STYLES.bg;
      arrowDiv.style.borderTop = `4px solid ${STYLES.bg}`;
      advancedMarker.style.zIndex = "1";
    }
  };
  advancedMarker.addListener("click", () => {
    sendToMixpanel("Selected Location Marker", { id, name });
    setTimeout(() => onLocationSelected(id));
  });
  advancedMarker.element.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

function clearMarkers(
  markersRef: React.RefObject<Map<UUID, AdvancedMarkerElement>>,
  labelSpansRef: React.RefObject<Map<number | string, HTMLSpanElement>>,
) {
  markersRef.current.forEach((marker) => {
    marker.map = null;
  });
  markersRef.current.clear();
  labelSpansRef.current.clear();
}

function createAndAddMarker(
  { geo, id, name, status }: GetPublicLocationsQuery["locations"][number],
  props: Props,
  STYLES: typeof COLOR_STYLES.LIGHT,
) {
  const { labelSpansRef, mapRef, markersRef, onLocationSelected, selectedLocationId } = props;
  if (!geo || !mapRef.current) return;
  const isSelected = id === selectedLocationId;
  const contentDiv = document.createElement("div");
  contentDiv.style.cursor = "pointer";
  const labelSpan = createLabelSpan(id, name, isSelected, status, STYLES);
  const arrowDiv = createArrowDiv(isSelected, status, STYLES);
  labelSpan.appendChild(arrowDiv);
  contentDiv.appendChild(labelSpan);

  const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
    content: contentDiv,
    map: mapRef.current,
    position: {
      lat: geo.coordinates[1],
      lng: geo.coordinates[0],
    },
    title: name,
  }) as AdvancedMarkerElement;

  advancedMarker.style.zIndex = isSelected ? "2" : "1";
  attachMarkerHandlers({
    advancedMarker,
    arrowDiv,
    id,
    isSelected,
    labelSpan,
    name,
    onLocationSelected,
    status,
    STYLES,
  });

  markersRef.current.set(id, advancedMarker);
  labelSpansRef.current.set(id, labelSpan);
}

function createArrowDiv(
  isSelected: boolean,
  status: Locations["status"],
  STYLES: typeof COLOR_STYLES.LIGHT,
): HTMLDivElement {
  const arrowDiv = document.createElement("div");
  arrowDiv.style.borderLeft = "4px solid transparent";
  arrowDiv.style.borderRight = "4px solid transparent";
  arrowDiv.style.bottom = "-3px";
  arrowDiv.style.height = "0";
  arrowDiv.style.left = "50%";
  arrowDiv.style.position = "absolute";
  arrowDiv.style.transform = "translateX(-50%)";
  arrowDiv.style.width = "0";
  arrowDiv.style.borderTop = `4px solid ${
    status === Location_Status_Enum.Pending ? STYLES.bgPending : isSelected ? STYLES.bgActive : STYLES.bg
  }`;
  return arrowDiv;
}

function createLabelSpan(
  id: number | string,
  name: string,
  isSelected: boolean,
  status: Locations["status"],
  STYLES: typeof COLOR_STYLES.LIGHT,
): HTMLSpanElement {
  const labelSpan = document.createElement("span");
  labelSpan.setAttribute("id", String(id));
  labelSpan.style.borderRadius = "30px";
  labelSpan.style.color = STYLES.onBg;
  labelSpan.style.position = "relative";
  labelSpan.style.whiteSpace = "nowrap";
  labelSpan.style.padding = "4px 8px";
  labelSpan.innerHTML = getTextContent(name);
  labelSpan.style.backgroundColor = isSelected
    ? STYLES.bgActive
    : status === Location_Status_Enum.Pending
      ? STYLES.bgPending
      : STYLES.bg;
  return labelSpan;
}

function drawMarkers(props: Props, STYLES: typeof COLOR_STYLES.LIGHT) {
  const { labelSpansRef, locations, mapRef, markersRef } = props;
  if (mapRef.current && locations) {
    clearMarkers(markersRef, labelSpansRef);
    locations.forEach((location) => createAndAddMarker(location, props, STYLES));
  }
}

function getTextContent(name: string, maxNumWords = 3): string {
  const words = name.split(" ");
  return words.length > maxNumWords ? `${words.slice(0, maxNumWords).join(" ")}...` : name;
}

import { useEffect } from "react";

import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { sendToMixpanel } from "~/lib/mixpanel";
import { GetPublicVenuesQuery, Venue_Category_Enum, Venue_Status_Enum, Venues } from "~/types";
import { UUID } from "~/types/uuid";

import { COLOR_STYLES } from "./constants";

type AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;

interface AttachMarkerHandlersParams {
  advancedMarker: AdvancedMarkerElement;
  arrowDiv: HTMLDivElement;
  category: Venue_Category_Enum;
  id: UUID;
  isSelected: boolean;
  labelSpan: HTMLSpanElement;
  name: string;
  onVenueSelected?: (id: UUID) => void;
  status: Venues["status"];
  STYLES: typeof COLOR_STYLES.LIGHT;
}

type Props = {
  colorScheme: "DARK" | "LIGHT";
  isLoaded: boolean;
  labelSpansRef: React.RefObject<Map<number | string, HTMLSpanElement>>;
  mapRef: React.RefObject<google.maps.Map | null>;
  markersRef: React.RefObject<Map<UUID, AdvancedMarkerElement>>;
  onVenueSelected?: (id: UUID) => void;
  selectedVenueId?: null | UUID;
  venues?: GetPublicVenuesQuery["venues"];
};

export function useDrawMarkers(props: Props) {
  useEffect(() => {
    if (!props.isLoaded || !props.venues) return;
    const STYLES = COLOR_STYLES[props.colorScheme];
    setTimeout(() => drawMarkers(props, STYLES));
  }, [props]);
}

function attachMarkerHandlers({
  advancedMarker,
  arrowDiv,
  category,
  id,
  isSelected,
  labelSpan,
  name,
  onVenueSelected,
  status,
  STYLES,
}: AttachMarkerHandlersParams) {
  labelSpan.onmouseover = () => {
    if (!isSelected && status !== Venue_Status_Enum.Pending) {
      labelSpan.style.backgroundColor = STYLES.bgHover;
      arrowDiv.style.borderTop = `4px solid ${STYLES.bgHover}`;
      advancedMarker.style.zIndex = "3";
      labelSpan.innerHTML = `${getTextContent(name)} `;
    }
  };
  labelSpan.onmouseout = () => {
    if (!isSelected) {
      labelSpan.style.backgroundColor = STYLES.bg;
      arrowDiv.style.borderTop = `4px solid ${STYLES.bg}`;
      advancedMarker.style.zIndex = "1";
      labelSpan.innerHTML = `${getCategory(category)}`;
    }
  };
  advancedMarker.addListener("click", () => {
    sendToMixpanel("Selected Venue Marker", { id, name });
    setTimeout(() => onVenueSelected?.(id));
  });
  advancedMarker.element.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

function clearMarkers(
  markersRef: React.RefObject<Map<UUID, AdvancedMarkerElement>>,
  labelSpansRef: React.RefObject<Map<number | string, HTMLSpanElement>>,
) {
  for (const marker of markersRef.current.values()) {
    marker.map = null;
  }

  markersRef.current.clear();
  labelSpansRef.current.clear();
}

function createAndAddMarker(
  { category, geo, id, name, status }: GetPublicVenuesQuery["venues"][number],
  props: Props,
  STYLES: typeof COLOR_STYLES.LIGHT,
) {
  const { labelSpansRef, mapRef, markersRef, onVenueSelected, selectedVenueId } = props;
  if (!geo || !mapRef.current) return;
  const isSelected = id === selectedVenueId;
  const contentDiv = document.createElement("div");
  contentDiv.style.cursor = "pointer";
  const labelSpan = createLabelSpan(id, name, category, isSelected, status, STYLES);
  const arrowDiv = createArrowDiv(isSelected, status, STYLES);
  // const notificationDiv = createNotificationDiv();
  labelSpan.appendChild(arrowDiv);
  // contentDiv.appendChild(notificationDiv);
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
    category,
    id,
    isSelected,
    labelSpan,
    name,
    onVenueSelected,
    status,
    STYLES,
  });

  markersRef.current.set(id, advancedMarker);
  labelSpansRef.current.set(id, labelSpan);
}

function createArrowDiv(
  isSelected: boolean,
  status: Venues["status"],
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
  arrowDiv.style.borderTop = `4px solid ${isSelected ? STYLES.bgActive : STYLES.bg}`;
  return arrowDiv;
}

function createLabelSpan(
  id: number | string,
  name: string,
  category: Venue_Category_Enum,
  isSelected: boolean,
  status: Venues["status"],
  STYLES: typeof COLOR_STYLES.LIGHT,
): HTMLSpanElement {
  const labelSpan = document.createElement("span");
  labelSpan.setAttribute("id", String(id));
  labelSpan.style.borderRadius = "8px";
  labelSpan.style.color = STYLES.onBg;
  labelSpan.style.position = "relative";
  labelSpan.style.whiteSpace = "nowrap";
  labelSpan.style.padding = "4px 8px";

  labelSpan.innerHTML = isSelected ? getTextContent(name) : getCategory(category);
  labelSpan.style.backgroundColor = isSelected ? STYLES.bgActive : STYLES.bg;

  return labelSpan;
}

// function createNotificationDiv(): HTMLDivElement {
//   const notificationDiv = document.createElement("div");
//   notificationDiv.style.backgroundColor = "red";
//   notificationDiv.style.borderRadius = "4px";
//   notificationDiv.style.height = "8px";
//   notificationDiv.style.width = "8px";
//   notificationDiv.style.border = "1px solid #fff";
//   notificationDiv.style.bottom = "16px";
//   notificationDiv.style.position = "absolute";
//   notificationDiv.style.right = "-2px";
//   notificationDiv.style.top = "-6px";
//   notificationDiv.style.zIndex = "100";
//   return notificationDiv;
// }

function drawMarkers(props: Props, STYLES: typeof COLOR_STYLES.LIGHT) {
  const { labelSpansRef, mapRef, markersRef, venues } = props;
  if (mapRef.current && venues) {
    clearMarkers(markersRef, labelSpansRef);
    for (const venue of venues) {
      createAndAddMarker(venue, props, STYLES);
    }
  }
}

function getCategory(value: Venue_Category_Enum) {
  const { iconName } = constants.categories[value as keyof typeof constants.categories];

  return getIcon(iconName, {
    asString: true,
    className: "inline mb-0.5 ml-0.5",
    height: 12,
    width: 12,
  });
}

function getTextContent(name: string, maxNumWords = 3): string {
  const words = name.split(" ");
  return words.length > maxNumWords ? `${words.slice(0, maxNumWords).join(" ")}...` : name;
}

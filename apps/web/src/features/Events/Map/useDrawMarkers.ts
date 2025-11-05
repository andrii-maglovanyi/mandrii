import { useEffect } from "react";

import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { sendToMixpanel } from "~/lib/mixpanel";
import { Event_Type_Enum, GetPublicEventsQuery } from "~/types";
import { UUID } from "~/types/uuid";

import { COLOR_STYLES } from "../../Venues/constants";

type AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;

interface AttachMarkerHandlersParams {
  advancedMarker: AdvancedMarkerElement;
  arrowDiv: HTMLDivElement;
  hasVenue: boolean;
  id: UUID;
  isSelected: boolean;
  labelSpan: HTMLSpanElement;
  onEventSelected?: (id: UUID) => void;
  STYLES: typeof COLOR_STYLES.LIGHT;
  title: string;
  type: Event_Type_Enum;
}

type Props = {
  colorScheme: "DARK" | "LIGHT";
  events?: GetPublicEventsQuery["events"];
  isLoaded: boolean;
  labelSpansRef: React.RefObject<Map<number | string, HTMLSpanElement>>;
  mapRef: React.RefObject<google.maps.Map | null>;
  markersRef: React.RefObject<Map<UUID, AdvancedMarkerElement>>;
  onEventSelected?: (id: UUID) => void;
  selectedEventId?: null | UUID;
};

export function useDrawMarkers(props: Props) {
  useEffect(() => {
    if (!props.isLoaded || !props.events) return;
    const STYLES = COLOR_STYLES[props.colorScheme];
    setTimeout(() => drawMarkers(props, STYLES));
  }, [props]);
}

function attachMarkerHandlers({
  advancedMarker,
  arrowDiv,
  hasVenue,
  id,
  isSelected,
  labelSpan,
  onEventSelected,
  STYLES,
  title,
  type,
}: AttachMarkerHandlersParams) {
  // Get reference to the text span (first child before arrow)
  const textSpan = labelSpan.querySelector("span.marker-text") as HTMLSpanElement;

  labelSpan.onmouseover = () => {
    if (!isSelected) {
      labelSpan.style.backgroundColor = STYLES.bgHover;
      arrowDiv.style.borderTop = `4px solid ${STYLES.bgHover}`;
      advancedMarker.style.zIndex = "4";
      if (textSpan) {
        textSpan.innerHTML = `${getTextContent(title)} `;
      }
    }
  };
  labelSpan.onmouseout = () => {
    if (!isSelected) {
      labelSpan.style.backgroundColor = STYLES.bg;
      arrowDiv.style.borderTop = `4px solid ${STYLES.bg}`;
      // Restore z-index hierarchy: venue-based (2) > custom location (1)
      advancedMarker.style.zIndex = hasVenue ? "2" : "1";
      if (textSpan) {
        textSpan.innerHTML = `${getEventType(type)}`;
      }
    }
  };
  advancedMarker.addListener("click", () => {
    sendToMixpanel("Selected Event Marker", { id, title });
    setTimeout(() => onEventSelected?.(id));
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
  event: GetPublicEventsQuery["events"][number],
  props: Props,
  STYLES: typeof COLOR_STYLES.LIGHT,
) {
  const { geo, id, title, type, venue } = event;
  const { labelSpansRef, mapRef, markersRef, onEventSelected, selectedEventId } = props;

  // Use event's geo if available, otherwise use venue's geo
  const eventGeo = geo || venue?.geo;
  if (!eventGeo || !mapRef.current) return;

  const coordinates = eventGeo as { coordinates: [number, number] };
  const isSelected = id === selectedEventId;
  const hasVenue = Boolean(venue);

  const contentDiv = document.createElement("div");
  contentDiv.style.cursor = "pointer";
  contentDiv.style.position = "relative";

  const labelSpan = createLabelSpan(id as UUID, String(title), type, isSelected, STYLES);
  const arrowDiv = createArrowDiv(isSelected, STYLES);

  // Add notification dot if event is at a venue
  if (hasVenue) {
    const notificationDiv = createNotificationDiv();
    contentDiv.appendChild(notificationDiv);
  }

  labelSpan.appendChild(arrowDiv);
  contentDiv.appendChild(labelSpan);

  const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
    content: contentDiv,
    map: mapRef.current,
    position: {
      lat: coordinates.coordinates[1],
      lng: coordinates.coordinates[0],
    },
    title: String(title),
  }) as AdvancedMarkerElement;

  // Z-index hierarchy: selected (3) > venue-based (2) > custom location (1)
  advancedMarker.style.zIndex = isSelected ? "3" : hasVenue ? "2" : "1";

  attachMarkerHandlers({
    advancedMarker,
    arrowDiv,
    hasVenue,
    id: id as UUID,
    isSelected,
    labelSpan,
    onEventSelected,
    STYLES,
    title: String(title),
    type,
  });

  markersRef.current.set(id as UUID, advancedMarker);
  labelSpansRef.current.set(id as UUID, labelSpan);
}

function createArrowDiv(isSelected: boolean, STYLES: typeof COLOR_STYLES.LIGHT): HTMLDivElement {
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
  title: string,
  eventType: Event_Type_Enum,
  isSelected: boolean,
  STYLES: typeof COLOR_STYLES.LIGHT,
): HTMLSpanElement {
  const labelSpan = document.createElement("span");
  labelSpan.setAttribute("id", String(id));
  labelSpan.style.borderRadius = "8px";
  labelSpan.style.color = STYLES.onBg;
  labelSpan.style.position = "relative";
  labelSpan.style.whiteSpace = "nowrap";
  labelSpan.style.padding = "4px 8px";
  labelSpan.style.backgroundColor = isSelected ? STYLES.bgActive : STYLES.bg;

  // Create a separate span for text content that can be updated without destroying the arrow
  const textSpan = document.createElement("span");
  textSpan.className = "marker-text";
  textSpan.style.fontSize = "12px";
  textSpan.innerHTML = isSelected ? getTextContent(title) : getEventType(eventType);
  labelSpan.appendChild(textSpan);

  return labelSpan;
}

function createNotificationDiv(): HTMLDivElement {
  const notificationDiv = document.createElement("div");
  notificationDiv.style.backgroundColor = "#00FFFF";
  notificationDiv.style.borderRadius = "50%";
  notificationDiv.style.height = "9px";
  notificationDiv.style.width = "9px";
  notificationDiv.style.border = "1px solid #fff";
  notificationDiv.style.position = "absolute";
  notificationDiv.style.right = "-3px";
  notificationDiv.style.top = "-7px";
  notificationDiv.style.zIndex = "100";
  return notificationDiv;
}

function drawMarkers(props: Props, STYLES: typeof COLOR_STYLES.LIGHT) {
  const { events, labelSpansRef, mapRef, markersRef } = props;

  if (mapRef.current && events) {
    clearMarkers(markersRef, labelSpansRef);
    for (const event of events) {
      createAndAddMarker(event, props, STYLES);
    }
  }
}

function getEventType(value: Event_Type_Enum) {
  const { iconName } = constants.eventTypes[value as keyof typeof constants.eventTypes];

  return getIcon(iconName, {
    asString: true,
    className: "inline pl-0.5 pb-0.5",
    height: 12,
    width: 12,
  });
}

function getTextContent(name: string, maxNumWords = 3): string {
  const words = name.split(" ");
  return words.length > maxNumWords ? `${words.slice(0, maxNumWords).join(" ")}...` : name;
}

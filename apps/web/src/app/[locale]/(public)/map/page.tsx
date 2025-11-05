import { MixpanelTracker } from "~/components/layout";
import { MapView } from "~/features/Map/MapView";

export default function MapPage() {
  return (
    <>
      <MapView />
      <MixpanelTracker event="Viewed Map Page" />
    </>
  );
}

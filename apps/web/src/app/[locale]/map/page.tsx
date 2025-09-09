import { Locations, MixpanelTracker } from "~/components/layout";

export default function MapPage() {
  return (
    <>
      <Locations />
      <MixpanelTracker event="Viewed Locations Page" />
    </>
  );
}

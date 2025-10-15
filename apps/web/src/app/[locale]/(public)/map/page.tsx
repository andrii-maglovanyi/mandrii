import { MixpanelTracker, Venues } from "~/components/layout";

export default function MapPage() {
  return (
    <>
      <Venues />
      <MixpanelTracker event="Viewed Venues Map Page" />
    </>
  );
}

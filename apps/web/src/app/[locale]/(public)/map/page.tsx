import { MixpanelTracker } from "~/components/layout";
import { Venues } from "~/features";

export default function MapPage() {
  return (
    <>
      <Venues />
      <MixpanelTracker event="Viewed Venues Map Page" />
    </>
  );
}

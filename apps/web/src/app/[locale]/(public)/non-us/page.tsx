import { MixpanelTracker } from "~/components/layout";
import { NonUS } from "~/features";

export default async function NonUsPage() {
  return (
    <>
      <NonUS />
      <MixpanelTracker event="Viewed Non US Page" />
    </>
  );
}

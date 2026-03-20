import { MixpanelTracker } from "~/components/layout";
import { NonUS } from "~/features";
import { contentManager } from "~/lib/mdx/reader";
import { Locale } from "~/types";

const type = "cv";
const id = "me";

export default async function NonUsPage() {
  const data = await contentManager.getContentById(type, id, Locale.EN);

  return (
    <>
      <NonUS />
      <MixpanelTracker event="Viewed Non US Page" />
    </>
  );
}

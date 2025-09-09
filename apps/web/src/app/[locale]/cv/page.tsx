import { ContentViewer, MixpanelTracker } from "~/components/layout";
import { contentManager } from "~/lib/mdx/reader";
import { Locale } from "~/types";

const type = "cv";
const id = "me";

export default async function AboutCookiesPage() {
  const data = await contentManager.getContentById(type, id, Locale.EN);

  return (
    <>
      <ContentViewer data={data} id={id} type={type} />
      <MixpanelTracker event="Viewed CV Page" />
    </>
  );
}

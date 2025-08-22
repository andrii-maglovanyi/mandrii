import { ContentViewer, MixpanelTracker } from "~/components/layout";
import { contentManager } from "~/lib/mdx/reader";
import { Locale } from "~/types";

const type = "about";
const id = "the-idea";

export default async function AboutCookiesPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const data = await contentManager.getContentById(type, id, locale);

  return (
    <>
      <ContentViewer data={data} id={id} type={type} />
      <MixpanelTracker event="Viewed The Idea Page" />
    </>
  );
}

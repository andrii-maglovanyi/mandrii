import { ContentViewer, MixpanelTracker } from "~/components/layout";
import { contentManager } from "~/lib/mdx/reader";
import { Locale } from "~/types";

interface AboutCookiesPageProps {
  params: Promise<{ locale: Locale }>;
}

const type = "about";
const id = "cookies";

export default async function AboutCookiesPage({ params }: AboutCookiesPageProps) {
  const { locale } = await params;
  const data = await contentManager.getContentById(type, id, locale);

  return (
    <>
      <ContentViewer data={data} id={id} type={type} />
      <MixpanelTracker event="Viewed About Cookies Page" />
    </>
  );
}

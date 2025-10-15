import { ContentViewer, MixpanelTracker } from "~/components/layout";
import { contentManager } from "~/lib/mdx/reader";
import { Locale } from "~/types";

interface TheIdeaPageProps {
  params: Promise<{ locale: Locale }>;
}

const type = "about";
const id = "the-idea";

export default async function TheIdeaPage({ params }: Readonly<TheIdeaPageProps>) {
  const { locale } = await params;
  const data = await contentManager.getContentById(type, id, locale);

  return (
    <>
      <ContentViewer data={data} id={id} type={type} />
      <MixpanelTracker event="Viewed The Idea Page" />
    </>
  );
}

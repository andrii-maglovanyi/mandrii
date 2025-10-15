import { ContentViewer, MixpanelTracker } from "~/components/layout";
import { contentManager } from "~/lib/mdx/reader";
import { Locale } from "~/types";

interface ClaimOwnershipPageProps {
  params: Promise<{ locale: Locale }>;
}

const type = "about";
const id = "claim-ownership";

export default async function ClaimOwnershipPage({ params }: ClaimOwnershipPageProps) {
  const { locale } = await params;
  const data = await contentManager.getContentById(type, id, locale);

  return (
    <>
      <ContentViewer data={data} id={id} type={type} />
      <MixpanelTracker event="Viewed Claim Ownership Page" />
    </>
  );
}

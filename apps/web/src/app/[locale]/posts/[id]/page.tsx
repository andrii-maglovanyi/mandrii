import { ContentViewer, MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { ContentData, contentManager } from "~/lib/mdx/reader";
import { Locale } from "~/types";

interface PostPageLayoutProps {
  data: ContentData | null;
  id: string;
  locale: Locale;
}

interface PostPageProps {
  params: Promise<{ id: string; locale: Locale; }>;
}

const type = "posts";

const PostPageLayout = ({ data, id, locale }: PostPageLayoutProps) => {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Posts"), url: `/${locale}/posts` }, { title: data?.meta.title ?? "..." }]} />
      <ContentViewer data={data} id={id} type={type} />
    </>
  );
};

export default async function PostPage({ params }: PostPageProps) {
  const { id, locale } = await params;
  const data = await contentManager.getContentById(type, id, locale);

  return (
    <>
      <PostPageLayout data={data} id={id} locale={locale} />
      <MixpanelTracker event="Viewed Post Page" props={{ id, locale }} />
    </>
  );
}

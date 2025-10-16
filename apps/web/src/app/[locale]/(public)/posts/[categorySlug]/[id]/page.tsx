import { ContentViewer, MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { ContentData, contentManager } from "~/lib/mdx/reader";
import { CategorySlug, getCategoryName } from "~/lib/posts/categories";
import { Locale } from "~/types";

interface PostPageLayoutProps {
  categoryName: null | string;
  categorySlug: CategorySlug;
  data: ContentData | null;
  id: string;
  locale: Locale;
}

interface PostPageProps {
  params: Promise<{ categorySlug: CategorySlug; id: string; locale: Locale }>;
}

const type = "posts";

const PostPageLayout = ({ categoryName, categorySlug, data, id, locale }: PostPageLayoutProps) => {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs
        items={[
          { title: i18n("Posts"), url: `/${locale}/posts` },
          { title: categoryName ?? "...", url: `/${locale}/posts/${categorySlug}` },
        ]}
      />
      <ContentViewer data={data} id={id} type={type} />
    </>
  );
};

export default async function PostPage({ params }: Readonly<PostPageProps>) {
  const { categorySlug, id, locale } = await params;
  const data = await contentManager.getContentById(type, id, locale);
  const categoryName = getCategoryName(categorySlug, locale);

  return (
    <>
      <PostPageLayout categoryName={categoryName} categorySlug={categorySlug} data={data} id={id} locale={locale} />
      <MixpanelTracker event="Viewed Post Page" props={{ id, locale }} />
    </>
  );
}

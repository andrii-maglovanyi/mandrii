import type { Metadata } from "next";

import { cache } from "react";

import { ContentViewer, MixpanelTracker } from "~/components/layout";
import { JsonLd } from "~/components/seo/JsonLd";
import { Breadcrumbs } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { ContentData, contentManager } from "~/lib/mdx/reader";
import { CategorySlug, getCategoryName } from "~/lib/posts/categories";
import { buildArticleStructuredData, buildPublicPageMetadata, buildPublicPageUrl, noIndexRobots } from "~/lib/seo";
import { Locale } from "~/types";

interface PostPageLayoutProps {
  categoryName: null | string;
  categorySlug: CategorySlug;
  data: ContentData | null;
  id: string;
}

interface PostPageProps {
  params: Promise<{ categorySlug: CategorySlug; id: string; locale: Locale }>;
}

const type = "posts";

const getPostContent = cache(async (id: string, locale: Locale) => {
  const hasLocalizedContent = contentManager.contentExists(type, id, locale);
  const data = await contentManager.getContentById(type, id, locale);

  return { data, hasLocalizedContent };
});

export async function generateMetadata({ params }: Readonly<PostPageProps>): Promise<Metadata> {
  const { categorySlug, id, locale } = await params;
  const { data, hasLocalizedContent } = await getPostContent(id, locale);
  const title = data?.meta.title ?? "Mandrii";
  const description = data?.meta.description ?? title;
  const image = data?.meta.images?.[0]
    ? `${constants.vercelBlobStorageUrl}/${type}/${id}/${data.meta.images[0]}`
    : undefined;

  return buildPublicPageMetadata({
    description,
    image,
    locale,
    pathname: `/posts/${categorySlug}/${id}`,
    robots: data && hasLocalizedContent ? undefined : noIndexRobots,
    title,
  });
}

const PostPageLayout = ({ categoryName, categorySlug, data, id }: PostPageLayoutProps) => {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs
        items={[
          { title: i18n("Posts"), url: `/posts` },
          { title: categoryName ?? "...", url: `/posts/${categorySlug}` },
        ]}
      />
      <ContentViewer data={data} id={id} showMeta type={type} />
    </>
  );
};

export default async function PostPage({ params }: Readonly<PostPageProps>) {
  const { categorySlug, id, locale } = await params;
  const { data, hasLocalizedContent } = await getPostContent(id, locale);
  const categoryName = getCategoryName(categorySlug, locale);
  const image = data?.meta.images?.[0]
    ? `${constants.vercelBlobStorageUrl}/${type}/${id}/${data.meta.images[0]}`
    : undefined;
  const url = buildPublicPageUrl(locale, `/posts/${categorySlug}/${id}`);
  const structuredData =
    data && hasLocalizedContent
      ? buildArticleStructuredData({
          description: data.meta.description ?? data.meta.title,
          image,
          locale,
          publishedAt: data.meta.date,
          title: data.meta.title,
          url,
        })
      : null;

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <PostPageLayout categoryName={categoryName} categorySlug={categorySlug} data={data} id={id} />
      <MixpanelTracker event="Viewed Post Page" props={{ id, locale }} />
    </>
  );
}

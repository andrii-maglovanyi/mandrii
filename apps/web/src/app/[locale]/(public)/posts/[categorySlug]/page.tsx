import { Library } from "lucide-react";

import { MixpanelTracker, PostCard } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { ContentData, contentManager } from "~/lib/mdx/reader";
import { CategorySlug, getCategoryName } from "~/lib/posts/categories";
import { Locale } from "~/types";

interface PostsCategoryLayoutProps {
  categoryName: null | string;
  locale: Locale;
  posts: Array<ContentData>;
}

interface PostsCategoryPageProps {
  params: Promise<{ categorySlug: CategorySlug; locale: Locale }>;
}

const type = "posts";

const PostsCategoryPageLayout = ({ categoryName, locale, posts }: PostsCategoryLayoutProps) => {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Posts"), url: `/posts` }]} />
      {categoryName && (
        <h1 className={`
          mb-12 flex items-center text-3xl font-extrabold text-on-surface
        `}>
          <Library className="mr-1" size={32} strokeWidth={3} /> {categoryName}
        </h1>
      )}

      <div className={`
        mb-32 grid gap-8 text-left
        md:grid-cols-3
        lg:mt-2 lg:mb-0 lg:w-full lg:max-w-5xl
      `}>
        {posts.map(({ content, id, meta }) => (
          <PostCard content={content} id={id} key={id} locale={locale} meta={meta} type={type} />
        ))}
      </div>
    </>
  );
};

export default async function PostsCategoryPage({ params }: Readonly<PostsCategoryPageProps>) {
  const { categorySlug, locale } = await params;
  const posts = await contentManager.getContent(type, locale, { categorySlug });
  const categoryName = getCategoryName(categorySlug, locale);

  return (
    <>
      <PostsCategoryPageLayout categoryName={categoryName} locale={locale} posts={posts} />
      <MixpanelTracker event="Viewed Posts Page" props={{ category: categoryName }} />
    </>
  );
}

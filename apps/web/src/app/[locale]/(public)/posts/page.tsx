import { MixpanelTracker, PostCard } from "~/components/layout";
import { PublicPageHeader } from "~/components/layout/PublicPageHeader/PublicPageHeader";
import { Breadcrumbs } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { ContentData, contentManager } from "~/lib/mdx/reader";
import { Locale } from "~/types";

interface PostsLayoutProps {
  locale: Locale;
  posts: Array<ContentData>;
}

interface PostsPageProps {
  params: Promise<{ locale: Locale }>;
}

const type = "posts";

const PostsPageLayout = ({ locale, posts }: PostsLayoutProps) => {
  const i18n = useI18n();

  return (
    <section className="flex flex-1 flex-col">
      <PublicPageHeader
        breadcrumbs={[{ title: i18n("Home"), url: "/" }]}
        title={i18n("Posts")}
        description={i18n("Things I find interesting, useful or worth sharing")}
      />
      <div
        className={`mb-32 grid gap-8 text-center lg:mt-2 lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-3 lg:text-left`}
      >
        {posts.map(({ content, id, meta }) => (
          <PostCard content={content} id={id} key={id} locale={locale} meta={meta} type={type} withCategory />
        ))}
      </div>
    </section>
  );
};

export default async function PostsPage({ params }: Readonly<PostsPageProps>) {
  const { locale } = await params;
  const posts = await contentManager.getContent(type, locale);

  return (
    <>
      <PostsPageLayout locale={locale} posts={posts} />
      <MixpanelTracker event="Viewed Posts Page" />
    </>
  );
}

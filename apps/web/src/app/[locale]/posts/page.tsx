import { MixpanelTracker, PostCard } from "~/components/layout";
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
    <>
      <h1 className="mb-12 text-5xl font-extrabold text-on-surface">{i18n("Posts")}</h1>

      <div
        className={`
          mb-32 grid gap-8 text-center
          lg:mt-2 lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-3 lg:text-left
        `}
      >
        {posts.map(({ content, id, meta }) => (
          <PostCard content={content} id={id} key={id} locale={locale} meta={meta} type={type} withCategory />
        ))}
      </div>
    </>
  );
};

export default async function PostsPage({ params }: PostsPageProps) {
  const { locale } = await params;
  const posts = await contentManager.getContent(type, locale);

  return (
    <>
      <PostsPageLayout locale={locale} posts={posts} />
      <MixpanelTracker event="Viewed Posts Page" />
    </>
  );
}

import { MixpanelTracker, PostCard } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { ContentData, contentManager } from "~/lib/mdx/reader";
import { Locale } from "~/types";

interface PostPageLayoutProps {
  locale: Locale;
  posts: Array<ContentData>;
}

interface PostsPageProps {
  params: Promise<{ locale: Locale }>;
}

const type = "posts";

const PostPageLayout = ({ locale, posts }: PostPageLayoutProps) => {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Posts"), url: `/${locale}/posts` }]} />
      <h1 className="mb-12 text-5xl font-extrabold text-on-surface">{i18n("Posts")}</h1>

      <div
        className={`
          mb-32 grid gap-8 text-center
          lg:mt-2 lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-3 lg:text-left
        `}
      >
        {posts.map(({ content, id, meta }) => (
          <PostCard content={content} id={id} key={id} locale={locale} meta={meta} type={type} />
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
      <PostPageLayout locale={locale} posts={posts} />
      <MixpanelTracker event="Viewed Posts Page" />
    </>
  );
}

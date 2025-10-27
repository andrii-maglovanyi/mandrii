import { useMemo } from "react";

import { MixpanelTracker, PostCard } from "~/components/layout";
import { VenuesBanner } from "~/features/Venues/VenuesBanner";
import { useI18n } from "~/i18n/useI18n";
import { ContentData, contentManager } from "~/lib/mdx/reader";
import { Locale } from "~/types";

interface HomePageLayoutProps {
  locale: Locale;
  posts: Array<ContentData>;
}

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

interface PostColumns {
  leftColumn: ContentData[];
  rightColumn: ContentData[];
}

const CONTENT_TYPE = "posts";
const POSTS_LIMIT = 4;

const distributePostsIntoColumns = (posts: ContentData[]): PostColumns => {
  if (posts.length === 0) {
    return { leftColumn: [], rightColumn: [] };
  }

  const [firstPost, secondPost, ...restPosts] = posts;

  const hasFirstPostImages = firstPost?.meta?.images?.length;

  if (hasFirstPostImages) {
    return {
      leftColumn: [firstPost],
      rightColumn: secondPost ? [secondPost, ...restPosts] : [],
    };
  }

  return {
    leftColumn: secondPost ? [firstPost, secondPost] : [firstPost],
    rightColumn: restPosts,
  };
};

const PostColumn = ({
  isLeftColumn = false,
  locale,
  posts,
  type,
}: {
  isLeftColumn?: boolean;
  locale: Locale;
  posts: ContentData[];
  type: string;
}) => (
  <div className={`
    flex flex-col gap-4
    md:w-1/2
  `}>
    {posts.map(({ content, id, meta }, index) => (
      <PostCard
        content={content}
        id={id}
        isFeatured={isLeftColumn && index === 0}
        isRecent={!isLeftColumn || index !== 0}
        key={id}
        locale={locale}
        meta={meta}
        type={type}
        withCategory
      />
    ))}
  </div>
);

const HomePageLayout = ({ locale, posts }: HomePageLayoutProps) => {
  const i18n = useI18n();

  const { leftColumn, rightColumn } = useMemo(() => distributePostsIntoColumns(posts), [posts]);

  const hasContent = posts.length > 0;

  return (
    <>
      <header className="mb-12 text-center">
        <h1
          className={`
            mx-auto w-fit bg-gradient-to-r from-primary to-secondary
            bg-clip-text text-4xl font-bold text-transparent
          `}
        >
          {i18n("Hi, friends!")} 👋
        </h1>
      </header>

      {hasContent ? (
        <main className={`
          mb-8 flex flex-col gap-6
          md:flex-row
        `}>
          {leftColumn.length > 0 && <PostColumn isLeftColumn locale={locale} posts={leftColumn} type={CONTENT_TYPE} />}

          {rightColumn.length > 0 && <PostColumn locale={locale} posts={rightColumn} type={CONTENT_TYPE} />}
        </main>
      ) : (
        <div className="py-12 text-center text-gray-500">
          <p>{i18n("No posts available")}</p>
        </div>
      )}

      <VenuesBanner />
    </>
  );
};

export default async function HomePage({ params }: Readonly<HomePageProps>) {
  const { locale } = await params;

  const posts = await contentManager.getContent(CONTENT_TYPE, locale, {
    limit: POSTS_LIMIT,
  });

  return (
    <>
      <HomePageLayout locale={locale} posts={posts} />
      <MixpanelTracker event="Viewed Index Page" props={{ postsCount: posts.length }} />
    </>
  );
}

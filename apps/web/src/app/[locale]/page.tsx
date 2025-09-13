import { MixpanelTracker, PostCard } from "~/components/layout";
import { LocationsBanner } from "~/components/layout/Locations/LocationsBanner";
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

const type = "posts";

const HomePageLayout = ({ locale, posts }: HomePageLayoutProps) => {
  const i18n = useI18n();
  const [fistPost, ...allPosts] = posts;

  return (
    <>
      <h2
        className={`
          w-fit bg-gradient-to-r from-primary to-secondary bg-clip-text
          text-center text-xl font-bold text-transparent
        `}
      >
        {i18n("Hi, friends!")} 👋
      </h2>

      {fistPost ? (
        <div className={`
          flex flex-col gap-6
          md:flex-row
        `}>
          <div className="md:w-1/2">
            <PostCard
              content={fistPost.content}
              id={fistPost.id}
              isFeatured
              locale={locale}
              meta={fistPost.meta}
              type={type}
              withCategory
            />
          </div>
          <div className={`
            flex flex-col gap-4
            md:w-1/2
          `}>
            {allPosts.map(({ content, id, meta }) => (
              <PostCard
                content={content}
                id={id}
                isRecent
                key={id}
                locale={locale}
                meta={meta}
                type={type}
                withCategory
              />
            ))}
          </div>
        </div>
      ) : null}

      <LocationsBanner />
    </>
  );
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const posts = await contentManager.getContent(type, locale, { limit: 4 });

  return (
    <>
      <HomePageLayout locale={locale} posts={posts} />
      <MixpanelTracker event="Viewed Index Page" />
    </>
  );
}

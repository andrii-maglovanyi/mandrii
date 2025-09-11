import { Map } from "lucide-react";

import { MixpanelTracker, PostCard } from "~/components/layout";
import { Button } from "~/components/ui";
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

      <div className={`
        mt-8 rounded-lg bg-gradient-to-r from-primary to-secondary p-[1px]
      `}>
        <div
          className={`
            flex flex-col space-y-6 rounded-lg bg-white p-6
            md:flex-row md:space-y-0 md:space-x-4
            dark:bg-black
          `}
        >
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{i18n("Let's unite, Ukrainians!")}</h3>
            <p className="mt-4">
              {i18n("Discover Ukrainian businesses, restaurants, cultural center and community hubs across Europe.")}
            </p>
            <p className="mt-2">
              {i18n(
                "Whether you're looking for a familiar place, a taste of home, feeling of unity or ways to support own people abroad - this map helps you to find and contribute to the community.",
              )}
            </p>
          </div>
          <div className={`
            flex shrink-0 items-center justify-center
            md:ml-auto md:min-w-max
          `}>
            <Button className={`
              w-full
              md:w-auto
            `} color="primary" isFeatured size="lg">
              <Map className="mr-2" />
              {i18n("Explore the Map")}
            </Button>
          </div>
        </div>
      </div>
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

import React from "react";

import { ImageCarousel } from "~/components/ui";
import { constants } from "~/lib/constants";
import { compileMDX } from "~/lib/mdx/compiler";
import { ContentData } from "~/lib/mdx/reader";

import { ContentMeta } from "./ContentMeta";

interface ContentViewerProps {
  data: ContentData | null;
  id: string;
  showMeta?: boolean;
  type: string;
  variables?: Record<string, string>;
}

export const ContentViewer = async ({ data, id, showMeta, type, variables }: ContentViewerProps) => {
  const { content, meta } = data || {
    content: "",
    meta: { date: "", description: "", images: [], title: "" },
  };

  const MDXContent = await compileMDX(content, variables);
  const Content = MDXContent.default;

  return (
    <div className="mx-auto max-w-5xl">
      <article className={`prose dark:prose-invert max-w-none space-y-6`}>
        <h1
          className={`mb-8 bg-[linear-gradient(to_right,var(--color-neutral)_0%,var(--color-on-surface)_30%,var(--color-on-surface)_70%,var(--color-neutral)_100%)] bg-clip-text text-center text-7xl text-transparent`}
        >
          {meta.title}
        </h1>
        {meta.description ? <p className={`text-neutral mb-8 text-center text-2xl`}>{meta.description}</p> : null}
        {meta.images?.length ? (
          <div className={`relative h-96 w-full overflow-hidden rounded-lg sm:h-[480px] md:h-[640px] lg:h-[720px]`}>
            <ImageCarousel
              images={meta.images?.map((image) => [constants.vercelBlobStorageUrl, type, id, image].join("/"))}
              preloadNext
              showDots
            />
          </div>
        ) : null}
        {showMeta && <ContentMeta id={id} meta={meta} type={type} />}
        <Content />
      </article>
    </div>
  );
};

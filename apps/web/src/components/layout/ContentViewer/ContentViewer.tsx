import React from "react";

import { ImageCarousel } from "~/components/ui";
import { constants } from "~/lib/constants";
import { compileMDX } from "~/lib/mdx/compiler";
import { ContentData } from "~/lib/mdx/reader";

import { ContentMeta } from "./ContentMeta";

interface ContentViewerProps {
  data: ContentData | null;
  id: string;
  type: string;
}

export const ContentViewer = async ({ data, id, type }: ContentViewerProps) => {
  const { content, meta } = data || {
    content: "",
    meta: { date: "", description: "", images: [], title: "" },
  };

  const MDXContent = await compileMDX(content);
  const Content = MDXContent.default;

  return (
    <div className="mx-auto max-w-5xl">
      <article className={`prose dark:prose-invert max-w-none space-y-6`}>
        <h1>{meta.title}</h1>
        {meta.description ? <p className="text-neutral">{meta.description}</p> : null}
        {meta.images?.length ? (
          <div className={`relative h-96 w-full overflow-hidden rounded-lg sm:h-[480px] md:h-[640px] lg:h-[720px]`}>
            <ImageCarousel
              images={meta.images?.map((image) => [constants.vercelBlobStorageUrl, type, id, image].join("/"))}
              preloadNext
              showDots
            />
          </div>
        ) : null}
        <ContentMeta id={id} meta={meta} type={type} />
        <Content />
      </article>
    </div>
  );
};

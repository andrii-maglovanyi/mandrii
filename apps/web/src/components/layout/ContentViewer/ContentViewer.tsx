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
      <article className={`
        prose max-w-none space-y-6
        dark:prose-invert
      `}>
        <h1>{meta.title}</h1>
        {meta.description ? <p className="text-neutral">{meta.description}</p> : null}
        {meta.images?.length ? (
          <div className={`
            relative h-64 w-full overflow-hidden rounded-lg
            sm:h-96
            md:h-[480px]
          `}>
            <ImageCarousel
              images={meta.images?.map((image) => [constants.vercelBlobStorageUrl, type, id, image].join("/"))}
            />
          </div>
        ) : null}
        <ContentMeta id={id} meta={meta} type={type} />
        <Content />
      </article>
    </div>
  );
};

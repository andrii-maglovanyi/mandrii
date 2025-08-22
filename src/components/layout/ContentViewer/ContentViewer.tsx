import React from "react";

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
    meta: { date: "", title: "" },
  };

  const MDXContent = await compileMDX(content);
  const Content = MDXContent.default;

  return (
    <div className="m-auto mx-auto max-w-5xl p-6">
      <div className="space-y-4">
        <ContentMeta id={id} meta={meta} type={type} />

        <article className={`
          prose max-w-none
          dark:prose-invert
        `}>
          <h1>{meta.title}</h1>
          <Content />
        </article>
      </div>
    </div>
  );
};

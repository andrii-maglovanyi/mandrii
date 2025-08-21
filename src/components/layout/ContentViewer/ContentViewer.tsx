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
    meta: { title: "", date: "" },
  };

  const MDXContent = await compileMDX(content);
  const Content = MDXContent.default;

  return (
    <div className="m-auto mx-auto max-w-5xl p-6">
      <div className="space-y-4">
        <ContentMeta meta={meta} id={id} type={type} />

        <article className={`prose dark:prose-invert max-w-none`}>
          <Content />
        </article>
      </div>
    </div>
  );
};

"use client";

import { format } from "date-fns";
import { useLocale } from "next-intl";

import { ContentData } from "~/lib/mdx/reader";
import { toDateLocale } from "~/lib/utils";

import { DownloadContentButton } from "./DownloadContentButton";

interface ContentMetaProps {
  id?: string;
  meta: ContentData["meta"];
  type: string;
}

export const ContentMeta = ({ id, meta, type }: ContentMetaProps) => {
  const locale = useLocale();

  return (
    <div className={`text-neutral-disabled flex items-center justify-end space-x-2 text-sm`}>
      {meta.date ? <span>{format(new Date(meta.date), "dd MMMM yyyy", { locale: toDateLocale(locale) })}</span> : null}
      {id ? <DownloadContentButton id={id} meta={meta} type={type} /> : null}
    </div>
  );
};

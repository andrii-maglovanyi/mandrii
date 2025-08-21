"use client";

import { ContentData } from "~/lib/mdx/reader";
import { DownloadContentButton } from "./DownloadContentButton";
import { format, Locale } from "date-fns";
import { useLocale } from "next-intl";
import { uk, enGB } from "date-fns/locale";

interface ContentMetaProps {
  meta: ContentData["meta"];
  id: string;
  type: string;
}

const localeMap: Record<string, Locale> = {
  uk: uk,
  en: enGB,
};

export const ContentMeta = ({ meta, id, type }: ContentMetaProps) => {
  const localeKey = useLocale();

  const locale = localeMap[localeKey] ?? enGB;

  return (
    <div className="text-neutral-disabled flex items-center justify-end space-x-1 text-sm">
      <span>{format(new Date(meta.date), "dd MMMM yyyy", { locale })}</span> <span>&bull;</span>
      <DownloadContentButton meta={meta} id={id} type={type} />
    </div>
  );
};

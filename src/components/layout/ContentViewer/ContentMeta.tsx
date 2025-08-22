"use client";

import { format, Locale } from "date-fns";
import { enGB, uk } from "date-fns/locale";
import { useLocale } from "next-intl";

import { ContentData } from "~/lib/mdx/reader";

import { DownloadContentButton } from "./DownloadContentButton";

interface ContentMetaProps {
  id: string;
  meta: ContentData["meta"];
  type: string;
}

const localeMap: Record<string, Locale> = {
  en: enGB,
  uk: uk,
};

export const ContentMeta = ({ id, meta, type }: ContentMetaProps) => {
  const localeKey = useLocale();

  const locale = localeMap[localeKey] ?? enGB;

  return (
    <div className={`
      flex items-center justify-end space-x-2 text-sm text-neutral-disabled
    `}>
      <span>{format(new Date(meta.date), "dd MMMM yyyy", { locale })}</span>
      <DownloadContentButton id={id} meta={meta} type={type} />
    </div>
  );
};

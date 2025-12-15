"use client";

import clsx from "clsx";
import { Library } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { constants } from "~/lib/constants";
import { ContentData } from "~/lib/mdx/reader";
import { getCategoryName } from "~/lib/posts/categories";
import { Locale } from "~/types";

import { ContentMeta } from "../ContentViewer/ContentMeta";

interface PostCardProps {
  content: string;
  id: string;
  isFeatured?: boolean;
  isRecent?: boolean;
  locale: Locale;
  meta: ContentData["meta"];
  type: string;
  withCategory?: boolean;
}

export const PostCard = ({ id, isFeatured, isRecent, locale, meta, type, withCategory }: PostCardProps) => {
  const { description, title } = meta;

  const categoryName = getCategoryName(meta.categorySlug, locale);

  return (
    <div className="flex flex-col text-left" key={id}>
      {meta.images?.length && !isRecent ? (
        <div
          className={clsx(
            `bg-neutral/10 relative h-82 w-full min-w-2/5 overflow-hidden rounded-lg`,
            isFeatured ? `md:h-96` : "md:h-48",
            isRecent ? "" : "mb-4",
          )}
        >
          <Image
            alt={title}
            className={`object-cover transition-transform duration-300 ease-in-out hover:scale-105`}
            fill
            sizes="(min-width: 1024px) 350px, 250px"
            src={`${constants.vercelBlobStorageUrl}/${type}/${id}/cover.webp`}
          />
        </div>
      ) : null}
      <div>
        {withCategory && categoryName ? (
          <div className="text-neutral mb-1 flex items-center space-x-2">
            <Library className="mr-1" size={18} />{" "}
            <Link href={`/${locale}/posts/${meta.categorySlug}`}>{categoryName}</Link>
          </div>
        ) : null}
        <Link href={`/${locale}/posts/${meta.categorySlug}/${id}`}>
          <h1 className={clsx(`text-3xl font-extrabold md:text-2xl`, isFeatured ? `md:text-5xl` : "")}>{title}</h1>
        </Link>
        <p className="text-on-surface mt-3">{description}</p>
        <div className={`border-surface-tint mt-4 border-t pt-2`}>
          <ContentMeta meta={meta} type={type} />
        </div>
      </div>
    </div>
  );
};

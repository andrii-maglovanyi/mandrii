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
    <div className={clsx("flex", isRecent ? "gap-4" : "flex-col text-left")} key={id}>
      <div
        className={clsx(
          "relative w-full min-w-2/5 overflow-hidden rounded-lg bg-neutral/10",
          isFeatured ? "h-96" : `
            h-82
            lg:h-48
          `,
          isRecent ? "" : "mb-4",
        )}
      >
        <Image
          alt={title}
          className={`
            object-cover transition-transform duration-300 ease-in-out
            hover:scale-105
          `}
          fill
          sizes="(min-width: 1024px) 350px, 250px"
          src={`${constants.vercelBlobStorageUrl}/${type}/${id}/cover.webp`}
        />
      </div>
      <div>
        {withCategory && categoryName ? (
          <div className="my-2 flex items-center space-x-2 text-neutral">
            <Library className="mr-1" size={18} />{" "}
            <Link href={`/${locale}/posts/${meta.categorySlug}`}>{categoryName}</Link>
          </div>
        ) : null}
        <Link href={`/${locale}/posts/${meta.categorySlug}/${id}`}>
          <h1 className={clsx("font-extrabold", isFeatured ? `
            mt-2 mb-6 text-5xl
          ` : `text-2xl`)}>{title}</h1>
        </Link>
        <p className={clsx("mt-3 text-on-surface", isRecent ? "text-sm" : "")}>{description}</p>
        <div className={`mt-4 border-t border-surface-tint pt-2`}>
          <ContentMeta meta={meta} type={type} />
        </div>
      </div>
    </div>
  );
};

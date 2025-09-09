"use client";

import clsx from "clsx";
import { Library } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { constants } from "~/lib/constants";
import { ContentData } from "~/lib/mdx/reader";

import { ContentMeta } from "../ContentViewer/ContentMeta";

interface PostCardProps {
  content: string;
  id: string;
  isFeatured?: boolean;
  isRecent?: boolean;
  locale: string;
  meta: ContentData["meta"];
  type: string;
}

export const PostCard = ({ id, isFeatured, isRecent, locale, meta, type }: PostCardProps) => {
  const { description, title } = meta;
  let { category } = meta;

  if (locale === "uk") {
    category = constants.posts.enabledCategories.find(({ name }) => name === category)?.name_uk || category;
  }

  return (
    <div className={clsx("flex", isRecent ? "gap-4" : "flex-col")} key={id}>
      <div
        className={clsx(
          "relative w-full min-w-2/5 overflow-hidden rounded-lg bg-neutral/10",
          isFeatured ? "h-96" : "h-48",
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
        {category ? (
          <div className="flex items-center space-x-2 text-sm text-neutral">
            <Library className="mr-1" size={16} /> {category}
          </div>
        ) : null}
        <Link href={`/${locale}/posts/${id}`}>
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

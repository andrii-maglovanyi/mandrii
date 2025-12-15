import { marked } from "marked";
import { JSX } from "react";

interface RichTextProps {
  as?: keyof JSX.IntrinsicElements;
  children: string;
  className?: string;
}

export const RichText = ({ as: Tag = "div", children, className }: RichTextProps) => {
  return (
    <Tag
      className={`
        prose prose-sm max-w-none
        dark:prose-invert
        ${className || ""}
      `}
      dangerouslySetInnerHTML={{
        __html: marked.parse(children, { breaks: true, gfm: true }),
      }}
    />
  );
};

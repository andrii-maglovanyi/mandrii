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
      className={`prose prose-sm dark:prose-invert max-w-none ${className || ""} `}
      dangerouslySetInnerHTML={{
        __html: marked.parse(children, { breaks: true, gfm: true }),
      }}
    />
  );
};

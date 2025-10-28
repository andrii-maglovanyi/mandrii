import { marked } from "marked";
import { JSX } from "react";

interface RichTextProps {
  as?: keyof JSX.IntrinsicElements;
  children: string;
  className?: string;
}

export const RichText = ({ as: Tag = "span", children, className }: RichTextProps) => {
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{
        __html: marked.parse(children, { breaks: true, gfm: true }),
      }}
    />
  );
};

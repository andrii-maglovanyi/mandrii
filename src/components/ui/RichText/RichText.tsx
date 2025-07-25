import DOMPurify from "dompurify";
import { JSX } from "react";
import snarkdown from "snarkdown";

interface RichTextProps {
  as?: keyof JSX.IntrinsicElements;
  children: string;
  className?: string;
}

export const RichText = ({
  as: Tag = "span",
  children,
  className,
}: RichTextProps) => {
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(snarkdown(children)),
      }}
    />
  );
};

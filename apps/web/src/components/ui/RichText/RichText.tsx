import { marked, Renderer } from "marked";
import { JSX } from "react";

interface RichTextProps {
  as?: keyof JSX.IntrinsicElements;
  children: string;
  className?: string;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

const safeHref = (href: string) => {
  if (href.startsWith("/") || href.startsWith("#")) return href;

  try {
    const url = new URL(href);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? href : null;
  } catch {
    return null;
  }
};

const createSafeRenderer = () => {
  const renderer = new Renderer();

  renderer.html = ({ text }) => escapeHtml(text);
  renderer.image = ({ text }) => escapeHtml(text);
  renderer.link = function ({ href, title, tokens }) {
    const label = this.parser.parseInline(tokens);
    const safeUrl = safeHref(href);

    if (!safeUrl) return label;

    const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
    const externalLinkAttributes = safeUrl.startsWith("http") ? ' target="_blank" rel="noreferrer"' : "";

    return `<a href="${escapeHtml(safeUrl)}"${titleAttribute}${externalLinkAttributes}>${label}</a>`;
  };

  return renderer;
};

export const RichText = ({ as: Tag = "div", children, className }: RichTextProps) => {
  return (
    <Tag
      className={`prose prose-sm dark:prose-invert max-w-none ${className || ""} `}
      dangerouslySetInnerHTML={{
        __html: marked.parse(children, { breaks: true, gfm: true, renderer: createSafeRenderer() }),
      }}
    />
  );
};

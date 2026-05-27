/** Renders a hint paragraph only when showHints is true */
export function Hint({ text, showHints }: { text: string; showHints: boolean }) {
  if (!showHints) return null;
  return <span className="text-neutral/80 text-xs">{text}</span>;
}

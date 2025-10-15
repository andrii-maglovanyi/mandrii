import clsx from "clsx";

interface AnimatedEllipsisProps {
  centered?: boolean;
  el?: string;
  size?: "lg" | "md" | "sm";
}

export const AnimatedEllipsis = ({ centered = false, el = "\u2022", size = "sm", ...props }: AnimatedEllipsisProps) => {
  let textSize = "";
  if (size === "lg") {
    textSize = "text-6xl";
  } else if (size === "md") {
    textSize = "text-4xl";
  }

  const content = (
    <>
      <span className={`
        animate-bounce
        [animation-delay:-0.3s]
      `}>{el}</span>
      <span className={`
        animate-bounce
        [animation-delay:-0.15s]
      `}>{el}</span>
      <span className="animate-bounce">{el}</span>
    </>
  );

  if (centered) {
    return (
      <div className={clsx(`
        inline-flex h-full min-h-6 w-full items-center justify-center
      `, textSize)} {...props}>
        {content}
      </div>
    );
  }

  return (
    <span className={clsx("inline-flex", textSize)} {...props}>
      {content}
    </span>
  );
};

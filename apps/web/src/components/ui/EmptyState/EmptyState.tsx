import clsx from "clsx";

import { RichText } from "../RichText/RichText";

export interface EmptyStateProps {
  body?: string;
  className?: string;
  heading?: string;
  icon: React.ReactNode;
}

export const EmptyState = ({ body, className, heading, icon }: EmptyStateProps) => {
  return (
    <div className={clsx("my-4 flex flex-col items-center justify-center", className)}>
      <div
        className={clsx(
          `bg-neutral-disabled/25 mb-8 flex h-[120px] w-[120px] items-center justify-center rounded-full`,
        )}
      >
        {icon}
      </div>

      {heading ? <div className="text-lg font-semibold">{heading}</div> : null}
      {body ? <RichText className="text-neutral mt-1.5 text-center">{body}</RichText> : null}
    </div>
  );
};

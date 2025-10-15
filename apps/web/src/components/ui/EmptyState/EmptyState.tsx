import { RichText } from "../RichText/RichText";

export interface EmptyStateProps {
  body?: string;
  heading?: string;
  icon: React.ReactNode;
}

export const EmptyState = ({ body, heading, icon }: EmptyStateProps) => {
  return (
    <div className="my-4 flex flex-col items-center justify-center">
      <div className={`bg-neutral-disabled/25 mb-8 flex h-[120px] w-[120px] items-center justify-center rounded-full`}>
        {icon}
      </div>

      {heading ? <div className="text-lg font-semibold">{heading}</div> : null}
      {body ? <RichText className="text-neutral mt-1.5 text-center">{body}</RichText> : null}
    </div>
  );
};

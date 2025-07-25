import clsx from "clsx";

export const FieldErrorMessage = ({ error }: { error?: string }) => {
  return (
    <div
      className={clsx(
        `
          h-4 origin-top text-sm text-red-500 transition-all duration-300
          ease-in-out
        `,
        error
          ? "scale-y-100 opacity-100"
          : "pointer-events-none scale-y-0 opacity-0",
      )}
    >
      {error}
    </div>
  );
};

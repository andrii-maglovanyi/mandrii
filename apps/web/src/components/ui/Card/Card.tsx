import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
}

export const Card = ({ children, className, href }: CardProps) => {
  return (
    <div className={clsx("relative", className)}>
      {href && <a className="pointer-events-auto absolute inset-0 z-10" href={href} />}
      <div className="pointer-events-none z-20 w-full">
        <div className={`
          h-full
          [&_[data-menu-overlay]]:pointer-events-auto
          [&_[role='listbox']]:pointer-events-auto
          [&_[role='option']]:pointer-events-auto
          [&_a]:pointer-events-auto
          [&_button]:pointer-events-auto
          [&_input]:pointer-events-auto
          [&_label]:pointer-events-auto
          [&_select]:pointer-events-auto
          [&_textarea]:pointer-events-auto
        `}>{children}</div>
      </div>
    </div>
  );
};

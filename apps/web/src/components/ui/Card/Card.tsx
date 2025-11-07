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
        <div className={`h-full [&_a]:pointer-events-auto [&_button]:pointer-events-auto`}>{children}</div>
      </div>
    </div>
  );
};

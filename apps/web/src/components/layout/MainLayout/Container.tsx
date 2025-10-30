import clsx from "clsx";
import { usePathname } from "next/navigation";

interface ContainerProps {
  children: React.ReactNode;
}

const COMMON_CLASS = "flex h-full grow flex-col w-full";
const DEFAULT_CLASS = "z-0 m-auto max-w-5xl space-y-6 overflow-y-auto px-4 py-12 leading-relaxed md:py-16";

export const Container = ({ children }: ContainerProps) => {
  const pathname = usePathname();

  // Match full-width pages with locale prefix (en or uk)
  const fullWidthPattern = /^\/(en|uk)\/(map(\/[^/]+)?|venues\/[^/]+)$/;

  return <main className={clsx(COMMON_CLASS, !fullWidthPattern.test(pathname) && DEFAULT_CLASS)}>{children}</main>;
};

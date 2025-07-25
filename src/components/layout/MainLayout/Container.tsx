import clsx from "clsx";
import { usePathname } from "next/navigation";

interface ContainerProps {
  children: React.ReactNode;
}

const COMMON_CLASS = "flex h-full grow flex-col w-full";

const DEFAULT_CLASS =
  "z-0 m-auto max-w-4xl space-y-6 overflow-y-auto px-4 py-12 leading-relaxed md:px-12 md:py-16";

export const Container = ({ children }: ContainerProps) => {
  const pathname = usePathname();

  return (
    <main
      className={clsx(
        COMMON_CLASS,
        !pathname.includes("/map") && DEFAULT_CLASS,
      )}
    >
      {children}
    </main>
  );
};

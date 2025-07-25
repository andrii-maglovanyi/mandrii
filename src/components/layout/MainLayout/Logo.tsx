import Image from "next/image";
import Link from "next/link";

export const Logo = () => (
  <div
    className={`
      relative w-[150px] text-on-surface drop-shadow-[0_0_1px_rgba(0,0,0,0.2)]
      dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.4)]
    `}
  >
    <Link className="block w-full cursor-pointer" href="/">
      <Image
        alt="Mandrii"
        className={`
          h-auto w-full
          dark:invert
        `}
        height={48}
        priority
        src="/static/logo.svg"
        width={130}
      />
    </Link>
  </div>
);

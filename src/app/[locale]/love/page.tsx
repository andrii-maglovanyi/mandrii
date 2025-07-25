import Image from "next/image";

import { MixpanelTracker } from "~/components/layout";
import {
  SOCIAL_LINKS,
  SUPPORT_LINKS,
} from "~/components/layout/PlatformLinks/link-configs";
import { PlatformLink } from "~/components/layout/PlatformLinks/PlatformLink";
import { useI18n } from "~/i18n/useI18n";

export default function LovePage() {
  const i18n = useI18n();

  return (
    <div
      className={`
        mx-auto flex flex-grow flex-col items-center justify-center space-y-6
        text-center
      `}
    >
      <div className={`
        border-b border-b-black
        dark:border-b-neutral-700
      `}>
        <Image
          alt="Mandrii"
          height={100}
          src="/static/mandrii.png"
          width={100}
        />
      </div>
      <h1
        className={`
          w-fit bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl
          font-bold text-transparent
        `}
      >
        {i18n("Thanks for your support")}
      </h1>
      <p className="text-xl">
        {i18n("No matter how hard things get, we're still together")}
      </p>
      <section className="mt-4 mb-6">
        <div
          className={`
            flex cursor-default flex-col items-center justify-center gap-4
            md:flex-row md:gap-6
          `}
        >
          <div className="space-x-2">
            {SOCIAL_LINKS.map((props) => (
              <PlatformLink key={props.type} size="large" {...props} />
            ))}
          </div>
          <div>&nbsp;</div>
          <div className="space-x-2">
            {SUPPORT_LINKS.map((props) => (
              <PlatformLink key={props.type} size="large" {...props} />
            ))}
          </div>
        </div>
      </section>
      <p className={`
        text-neutral-700
        dark:text-neutral-300
      `}>
        {i18n("Even a small gesture means the world.")}
        <br />
        {i18n("Thank you for being part of this adventure.")}
      </p>

      <div>
        <Image
          alt="Mandrii"
          className={`
            mt-2 h-auto
            dark:invert
          `}
          height={44}
          src="/static/logo.svg"
          width={120}
        />
        <div className="mt-1 text-center text-xs">
          мандруй &bull; мрій &bull; дій
        </div>
      </div>
      <MixpanelTracker event="Viewed Love Page" />
    </div>
  );
}

import Link from "next/link";

import { RichText } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

import { NewsletterForm } from "../Newsletter/NewsletterForm";
import { SOCIAL_LINKS, SUPPORT_LINKS } from "../PlatformLinks/link-configs";
import { PlatformLink } from "../PlatformLinks/PlatformLink";

export const Footer = () => {
  const i18n = useI18n();
  return (
    <footer className={`
      mndr-layout-glow px-6 py-10 text-sm
      md:px-16
    `}>
      <div className={`
        grid grid-cols-1 justify-start gap-8
        md:grid-cols-2
      `}>
        <div className="space-y-3">
          <h3 className="font-semibold">{i18n("More")}</h3>
          <div>
            <Link href="/the-idea">{i18n("The idea")}</Link>
          </div>
          <div>
            <Link href="/about-cookies">{i18n("About cookies")}</Link>
          </div>
          <div>
            <Link href="/contact">{i18n("Contact me")}</Link>
          </div>
        </div>

        <div className="flex justify-end">
          <NewsletterForm />
        </div>
      </div>

      <div
        className={`
          mt-8 flex flex-col items-center justify-between border-t pt-6
          text-on-surface
          md:flex-row
        `}
      >
        <div>
          2025 <strong className="mr-4">Мандрій</strong>{" "}
          <span className="opacity-60">мандруй &bull; мрій &bull; дій</span>
        </div>
        <div>
          <div className={`
            mt-3 space-x-2
            md:mt-0
          `}>
            {SOCIAL_LINKS.map((props) => (
              <PlatformLink key={props.type} {...props} />
            ))}
            <div className="ml-6 inline-block space-x-2">
              {SUPPORT_LINKS.map((props) => (
                <PlatformLink key={props.type} {...props} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <RichText as="p" className="mt-6 text-end text-xs">
        {i18n(
          "This site is protected by reCAPTCHA and the Google [Privacy Policy]({policy_link}) and [Terms of Service]({terms_link}) apply.",
          {
            policy_link: "https://policies.google.com/privacy",
            terms_link: "https://policies.google.com/terms",
          },
        )}
      </RichText>
    </footer>
  );
};

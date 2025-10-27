import Link from "next/link";

import { ContentViewer, MixpanelTracker } from "~/components/layout";
import { RichText } from "~/components/ui";
import { ClaimOwnership } from "~/features";
import { getI18n } from "~/i18n/getI18n";
import { auth } from "~/lib/auth";
import { fetchVenueBySlug } from "~/lib/graphql/queries";
import { contentManager } from "~/lib/mdx/reader";
import { Locale } from "~/types";

interface ClaimOwnershipPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ venue?: string }>;
}

const type = "about";
const id = "claim-ownership";

export default async function ClaimOwnershipPage({ params, searchParams }: Readonly<ClaimOwnershipPageProps>) {
  const { locale } = await params;
  const { venue: venueSlug } = await searchParams;
  const i18n = await getI18n({ locale });

  const data = await contentManager.getContentById(type, id, locale);
  const session = await auth();

  const venueData = venueSlug ? await fetchVenueBySlug(venueSlug) : null;
  const withVenue = Boolean(venueSlug && venueData);

  const mdxVariables = venueData
    ? {
        VENUE_ADDRESS:
          venueData.address ||
          [venueData.city, venueData.country].filter(Boolean).join(", ") ||
          i18n(
            "Take control of your venue's profile. Update information, create events, and connect with your community.",
          ),
        VENUE_NAME: venueData.name || i18n("Claim your venue"),
      }
    : {
        VENUE_ADDRESS: i18n(
          "Take control of your venue's profile. Update information, create events, and connect with your community.",
        ),
        VENUE_NAME: i18n("Claim your venue"),
      };

  const steps = [
    {
      description: (
        <>
          {i18n("Send me an email with:")}
          <ul className="ml-4 list-disc space-y-1">
            <li>{i18n("Proof that you manage this venue (business email, social media account, etc.)")}</li>
            <li>{i18n("A few words about what makes your venue special for the community")}</li>
          </ul>
        </>
      ),
      title: i18n("Submit verification request"),
    },
    {
      description: <RichText>{i18n("I'll review your request and grant access within **24-48 hours**.")}</RichText>,
      title: i18n("That's it! Wait for approval"),
    },
  ];

  if (!withVenue) {
    steps.unshift({
      description: (
        <RichText>
          {i18n(
            "Search for your venue in the [catalog](/venues) and click **<Crown className='mb-1.5 inline' size={18} />I own this venue** to start the verification process.",
          )}
        </RichText>
      ),
      title: i18n("Find your venue"),
    });
  }

  if (!session?.user) {
    steps.unshift({
      description: (
        <>{i18n("Create an account or sign in to get started. You'll need to be logged in to verify ownership.")}</>
      ),
      title: i18n("Sign in to your account"),
    });
  }

  return (
    <>
      <div className="mx-auto space-y-16">
        <ContentViewer data={data} id={id} type={type} variables={mdxVariables} />

        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">{i18n("How it works")}</h2>
            <p className="text-neutral">{i18n("Simple steps to verify and manage your venue")}</p>
          </div>

          <ol className="space-y-6">
            {steps.map((step, index) => (
              <li className="flex gap-4" key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      flex h-8 min-h-8 w-8 items-center justify-center
                      rounded-full bg-primary text-xs font-semibold
                      tracking-wide text-surface
                    `}
                  >
                    {index + 1}
                  </div>
                  {index < steps.length - 1 ? (
                    <span aria-hidden="true" className={`
                      mt-1 h-full w-px bg-primary/30
                    `} />
                  ) : null}
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="mt-0.5 text-xl font-semibold">{step.title}</h3>
                  <div className="text-neutral">{step.description}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className={`
            flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br
            from-primary/10 to-transparent p-6 pb-12
          `}
        >
          <h3 className="mt-4 text-center text-3xl font-bold">{i18n("Ready to claim your venue?")}</h3>
          <div className={`
            mt-2 flex w-full flex-col items-center justify-center gap-4
          `}>
            {venueData ? (
              <ClaimOwnership name={venueData.name} slug={venueData.slug} />
            ) : (
              <Link
                className={`
                  flex items-center justify-center rounded-xl border-2
                  border-primary/20 bg-surface px-12 py-2 font-medium
                  text-on-surface no-underline transition-all duration-300
                  hover:border-primary/40 hover:bg-surface-tint
                  sm:w-auto
                `}
                href="/venues"
              >
                {i18n("Browse venues")}
              </Link>
            )}
          </div>
        </section>
      </div>

      <MixpanelTracker event="Viewed Claim Ownership Page" />
    </>
  );
}

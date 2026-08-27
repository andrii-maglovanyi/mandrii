"use client";

import { useMemo } from "react";

import {
  Banknote,
  Building2,
  CalendarDays,
  FileText,
  GraduationCap,
  Home,
  IdCard,
  type LucideIcon,
  Mail,
  PawPrint,
  Scale,
  ScrollText,
  TrendingUp,
  Users,
} from "lucide-react";

import { Alert, Card, UnionJack } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

type CalloutVariant = "info" | "warning" | "tip";

type SectionContent =
  | { type: "text"; text: string }
  | { type: "callout"; variant: CalloutVariant; text: string }
  | { type: "list"; heading: string; items: string[] };

type Section = {
  id: string;
  title: string;
  icon: LucideIcon;
  content: SectionContent[];
};

const alertVariantMap: Record<CalloutVariant, "info" | "success" | "warning"> = {
  info: "info",
  tip: "success",
  warning: "warning",
};

function SectionCard({ content, icon: Icon, title }: { content: SectionContent[]; icon: LucideIcon; title: string }) {
  return (
    <div className="border-outline-variant bg-surface pointer-events-auto space-y-4 rounded-2xl border p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary flex min-h-10 min-w-10 items-center justify-center rounded-xl">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-on-surface pt-1 text-base font-semibold md:text-lg">{title}</h2>
      </div>

      <div className="space-y-3">
        {content.map((block, i) => {
          if (block.type === "text") {
            return (
              <p key={i} className="text-neutral text-sm leading-relaxed md:text-base">
                {block.text}
              </p>
            );
          }
          if (block.type === "callout") {
            return (
              <Alert key={i} variant={alertVariantMap[block.variant]}>
                {block.text}
              </Alert>
            );
          }
          if (block.type === "list") {
            return (
              <div key={i} className="space-y-2">
                <p className="text-on-surface text-sm font-semibold md:text-base">{block.heading}</p>
                <ul className="space-y-1.5 pl-2">
                  {block.items.map((item, j) => (
                    <li key={j} className="text-neutral flex items-start gap-2 text-sm md:text-base">
                      <span className="bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export function RentersRightsAct() {
  const i18n = useI18n();

  const sections: Section[] = useMemo(
    () => [
      {
        id: "who-it-affects",
        title: i18n("Who does this affect?"),
        icon: Users,
        content: [
          {
            type: "callout",
            variant: "info",
            text: i18n(
              "These changes only affect you if you are a tenant in the private rented sector with an assured or assured shorthold tenancy. If you live in social housing or you are a lodger, the new rules will not usually apply to you.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "These rules have been introduced by law. Your landlord cannot put anything into a tenancy agreement to change or disapply them. The new rules apply to your tenancy automatically, even if your landlord does not update your tenancy agreement.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "This document is only a summary of the changes. The new rules may change or impact your tenancy in a way not described below.",
            ),
          },
          {
            type: "callout",
            variant: "info",
            text: i18n(
              "If you do not have a written tenancy agreement or any written record of the tenancy's terms, then your landlord must provide you with certain written information on or before 31 May 2026.",
            ),
          },
        ],
      },
      {
        id: "notice-before-may",
        title: i18n("If your landlord has already served a notice seeking possession"),
        icon: Scale,
        content: [
          {
            type: "callout",
            variant: "warning",
            text: i18n(
              "The changes explained in this document may not apply to your tenancy on 1 May 2026 if your landlord serves a notice seeking possession under section 8 or section 21 of the Housing Act 1988 before 1 May 2026.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "If this happens, your landlord may still be able to take you to court to end your tenancy under the previous rules. You should seek advice if this happens to you.",
            ),
          },
        ],
      },
      {
        id: "right-to-rent",
        title: i18n("Your right to rent"),
        icon: IdCard,
        content: [
          {
            type: "text",
            text: i18n(
              "Before you can legally rent a home in England, your landlord is required by law to check that you have the right to rent. This applies to all tenants, but is especially important if you are not a British or Irish citizen.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "The easiest way to prove your right to rent is through the government's online share code service. You generate a share code using your identity document at gov.uk/view-right-to-rent and give it to your landlord so they can verify your status online.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "If your permission to stay in the UK is time-limited - for example, you are on a visa - your landlord must carry out a follow-up check before your leave expires. They cannot use a routine follow-up check as a reason to end your tenancy while your status remains valid.",
            ),
          },
          {
            type: "callout",
            variant: "warning",
            text: i18n(
              "If your immigration status changes and you no longer have the right to rent in England, your landlord may apply to court to end your tenancy under Ground 7B. If your immigration status is uncertain, seek advice from an immigration adviser as soon as possible.",
            ),
          },
          {
            type: "callout",
            variant: "tip",
            text: i18n(
              "A landlord cannot refuse to rent to you based on your nationality alone - that is unlawful discrimination under the Equality Act 2010. If you believe you were refused a tenancy because of your nationality rather than your actual immigration status, you can seek advice from the Equality Advisory Support Service (EASS).",
            ),
          },
        ],
      },
      {
        id: "fixed-terms",
        title: i18n("Changes to fixed-term tenancies"),
        icon: CalendarDays,
        content: [
          {
            type: "text",
            text: i18n(
              "You might have a fixed term tenancy. For example, your tenancy agreement may say the tenancy would last for 12 months.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "After 1 May 2026, it will not be possible for assured tenancy agreements to have a fixed term or a set end date. All tenancies will automatically become rolling tenancies from 1 May 2026 (sometimes known as 'periodic tenancies').",
            ),
          },
          {
            type: "text",
            text: i18n(
              "Your tenancy will continue on a rolling basis. This will usually be monthly, unless your tenancy agreement sets out a shorter period, for example weekly or fortnightly. If your tenancy had an end date, it will no longer apply.",
            ),
          },
          {
            type: "list",
            heading: i18n("Your tenancy will continue until:"),
            items: [
              i18n("You and your landlord decide together to end the tenancy"),
              i18n("You end your tenancy by giving notice"),
              i18n("Your landlord ends it, if they have a valid legal reason"),
            ],
          },
        ],
      },
      {
        id: "ast-name-change",
        title: i18n("Change to the name of Assured Shorthold Tenancies"),
        icon: FileText,
        content: [
          {
            type: "text",
            text: i18n(
              "Your tenancy agreement might call your tenancy an 'Assured Shorthold Tenancy'. This is the name of the private rented tenancy system until 1 May 2026.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "Assured Shorthold Tenancies will be abolished on 1 May 2026. Any tenancy previously called an Assured Shorthold Tenancy will automatically become an Assured Periodic Tenancy instead. Your tenancy will not end because of this change.",
            ),
          },
        ],
      },
      {
        id: "rent-increases",
        title: i18n("Rent increases"),
        icon: TrendingUp,
        content: [
          {
            type: "text",
            text: i18n(
              "Your tenancy agreement may contain rent review clauses. These are terms in the agreement that allow the landlord to increase the rent.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "Rent review clauses cannot be used for new rent increases after 1 May 2026. If you have a rent review clause in your current tenancy agreement, it will not apply after this date.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "Landlords must instead use the process in section 13 of the Housing Act 1988 for increasing the rent. They will need to give you written notice of the proposed rent increase at least 2 months before that increase would take effect, using a form called Form 4A.",
            ),
          },
          {
            type: "list",
            heading: i18n("Under the new rules, your landlord:"),
            items: [
              i18n("Can only increase the rent once per year"),
              i18n("Must give you at least 2 months' written notice using Form 4A"),
              i18n("Cannot increase rent above the open market rate"),
            ],
          },
          {
            type: "callout",
            variant: "tip",
            text: i18n(
              "If you think a proposed rent increase is above market rate, you can challenge it at the First-tier Tribunal.",
            ),
          },
        ],
      },
      {
        id: "eviction",
        title: i18n("If your landlord wants to end your tenancy"),
        icon: Home,
        content: [
          {
            type: "text",
            text: i18n(
              "Your tenancy agreement may say that your landlord can evict you without a reason. This was known as a section 21 eviction.",
            ),
          },
          {
            type: "callout",
            variant: "warning",
            text: i18n(
              "Your landlord cannot give you a section 21 notice on or after 1 May 2026, even if your tenancy agreement says they can.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "Instead, your landlord will need a legal reason to evict you. These reasons are called grounds for possession. Below is a brief summary of some of the main grounds. You can find full details of these and other grounds on GOV.UK.",
            ),
          },
          {
            type: "list",
            heading: i18n("Valid grounds your landlord may use include:"),
            items: [
              i18n("You have not paid your rent on time"),
              i18n("You, others living with you, or visitors commit antisocial behaviour in or near the property"),
              i18n("You or others living with you do not care for the property properly"),
              i18n("The tenancy was connected to your employment, or was for temporary or supported accommodation"),
            ],
          },
          {
            type: "list",
            heading: i18n("For the first 12 months of a tenancy, your landlord cannot evict you because:"),
            items: [
              i18n("They intend to sell the property"),
              i18n("They or a family member want to move into the property"),
            ],
          },
          {
            type: "text",
            text: i18n(
              "Your landlord must give you a section 8 notice using one or more grounds for possession, stating the date by which you are asked to leave and the required notice period for each ground.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "If you have not left by the end of the notice period, your landlord will need to apply to court for a possession order. At court, your landlord must provide evidence that they have a valid reason to evict you. You will have the opportunity to explain why you think your landlord does not have a legal reason to evict you, or why eviction is not reasonable under certain grounds.",
            ),
          },
          {
            type: "callout",
            variant: "tip",
            text: i18n(
              "You can access free legal advice through the Housing Loss Prevention Advice Service before going to court and on the day of the court hearing.",
            ),
          },
        ],
      },
      {
        id: "giving-notice",
        title: i18n("If you want to end your tenancy"),
        icon: Mail,
        content: [
          {
            type: "text",
            text: i18n(
              "You will be able to end the tenancy at any point by giving your landlord notice. You will need to give your landlord at least 2 months' notice.",
            ),
          },
          {
            type: "list",
            heading: i18n("The notice must:"),
            items: [
              i18n("Be given in writing, for example by letter or email"),
              i18n("End on a day when rent is due, or the day before rent is due"),
            ],
          },
          {
            type: "callout",
            variant: "info",
            text: i18n(
              "You can agree a shorter notice period with your landlord in writing, as long as any other tenants named on the tenancy agreement also agree.",
            ),
          },
        ],
      },
      {
        id: "deposit-protection",
        title: i18n("Your tenancy deposit"),
        icon: Banknote,
        content: [
          {
            type: "text",
            text: i18n(
              "If you pay a tenancy deposit, your landlord must protect it in one of three government-approved schemes within 30 days of receiving it: the Deposit Protection Service (DPS), MyDeposits, or the Tenancy Deposit Scheme (TDS).",
            ),
          },
          {
            type: "text",
            text: i18n(
              "Your landlord must also give you written information - called 'prescribed information' - about which scheme holds your deposit, how to get it back at the end of the tenancy, and what to do if there is a dispute.",
            ),
          },
          {
            type: "list",
            heading: i18n("Key rules about deposits:"),
            items: [
              i18n("The maximum deposit is 5 weeks' rent (or 6 weeks if your annual rent is £50,000 or more)"),
              i18n("Your landlord must return your deposit within 10 days of you both agreeing the final amount"),
              i18n(
                "If there is a dispute, the deposit scheme offers a free resolution service - you do not need to go to court",
              ),
            ],
          },
          {
            type: "callout",
            variant: "warning",
            text: i18n(
              "If your landlord does not protect your deposit in an approved scheme, you can apply to court for a penalty of up to 3 times the deposit amount. An unprotected deposit may also prevent your landlord from serving a valid eviction notice.",
            ),
          },
          {
            type: "callout",
            variant: "tip",
            text: i18n(
              "You can check whether your deposit is protected at any time by searching the DPS, MyDeposits, or TDS websites, or by asking your landlord to show you the prescribed information.",
            ),
          },
        ],
      },
      {
        id: "ombudsman-database",
        title: i18n("Landlord register and ombudsman"),
        icon: Building2,
        content: [
          {
            type: "text",
            text: i18n(
              "The Renters' Rights Act introduces a new national Private Rented Sector Database. All landlords in England must register their properties on this database before renting them out.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "As a tenant, you will be able to check whether your landlord is registered. Renting from an unregistered landlord is a warning sign - it may mean the landlord is not meeting their legal obligations.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "All private landlords must also join a new mandatory ombudsman scheme. If you have a complaint about your landlord that you cannot resolve directly - for example, about repairs not being done, deposit disputes, or poor property management - you can take it to the ombudsman for free.",
            ),
          },
          {
            type: "callout",
            variant: "tip",
            text: i18n(
              "Using the ombudsman is free for tenants and does not require you to go to court. The ombudsman can require your landlord to take action and award you compensation of up to £25,000.",
            ),
          },
          {
            type: "callout",
            variant: "info",
            text: i18n(
              "These requirements are being introduced in phases. If you are unsure whether your landlord is registered or has joined the ombudsman scheme, visit gov.uk or contact Citizens Advice for guidance.",
            ),
          },
        ],
      },
      {
        id: "pets",
        title: i18n("Keeping a pet"),
        icon: PawPrint,
        content: [
          {
            type: "text",
            text: i18n(
              "From 1 May 2026, you have the right to request to keep a pet. Your landlord cannot unreasonably refuse your request.",
            ),
          },
          {
            type: "list",
            heading: i18n("If your landlord refuses:"),
            items: [
              i18n("They must inform you in writing"),
              i18n("They should tell you the reason why"),
              i18n("They must consider each request on a case-by-case basis"),
              i18n("You can challenge their decision in court"),
            ],
          },
        ],
      },
      {
        id: "students",
        title: i18n("If you are a student renting privately"),
        icon: GraduationCap,
        content: [
          {
            type: "text",
            text: i18n(
              "If you are a full-time student, your landlord may be able to evict you using possession ground 4A at the end of the academic year, with 4 months' notice ending between 1 June and 30 September.",
            ),
          },
          {
            type: "callout",
            variant: "warning",
            text: i18n(
              "Your landlord can only use ground 4A if they have previously given you written notice that they may use it - by 31 May 2026 in most cases. This information sheet does not count as that written notice.",
            ),
          },
          {
            type: "text",
            text: i18n(
              "If your landlord wants to evict you at the end of the 2025/26 academic year, they can serve notice between 1 May and 30 July 2026 (inclusive), with at least 2 months' notice.",
            ),
          },
        ],
      },
    ],
    [i18n],
  );

  return (
    <Card className="md:border-primary md:bg-surface mx-auto h-max overflow-hidden rounded-3xl md:border-2 md:shadow-xl">
      {/* Hero header */}
      <div className="relative z-10 overflow-hidden rounded-3xl px-2 py-6 sm:py-9 md:rounded-none md:px-8 md:py-12">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <UnionJack
            className="absolute top-1/2 left-0 h-[140%] w-[70%] -translate-y-1/2 transform opacity-15"
            style={{
              maskImage: "linear-gradient(90deg, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: "linear-gradient(90deg, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, transparent 55%, var(--color-surface) 100%)" }}
          />
        </div>
        <div className="z-50 flex items-start gap-3 md:py-2 lg:py-6">
          <div className="bg-primary text-surface flex min-h-12 min-w-12 items-center justify-center rounded-2xl shadow-md">
            <ScrollText className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h1 className="text-on-surface text-xl font-bold md:text-2xl lg:text-3xl">
              {i18n("Renters' Rights Act 2025")}
            </h1>
            <p className="text-neutral max-w-4xl">
              {i18n(
                "From 1 May 2026, the Renters' Rights Act 2025 will give tenants new rights and introduce new rules for private landlords. This information sheet explains how the new rules may affect your current tenancy.",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-6 px-4 pt-4 pb-8 md:px-12 md:py-8">
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <SectionCard key={section.id} content={section.content} icon={section.icon} title={section.title} />
          ))}
        </div>

        {/* Footer help links */}
        <div className="border-outline-variant bg-surface-variant pointer-events-auto rounded-2xl border px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 text-primary flex min-h-10 min-w-10 items-center justify-center rounded-xl">
              <ScrollText className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <p className="text-on-surface text-sm font-semibold">{i18n("Need more help?")}</p>
              <p className="text-neutral text-sm leading-relaxed">
                {i18n(
                  "These resources provide free guidance and advice on your rights as a private tenant in England:",
                )}
              </p>
              <ul className="space-y-2">
                {[
                  {
                    href: "https://www.gov.uk/private-renting",
                    label: i18n("GOV.UK - official guidance on private renting, forms and legislation"),
                  },
                  {
                    href: "https://england.shelter.org.uk/housing_advice/private_renting",
                    label: i18n("Shelter - free housing advice and legal support for renters"),
                  },
                  {
                    href: "https://www.citizensadvice.org.uk/housing/renting-privately/",
                    label: i18n("Citizens Advice - help with tenancy rights, deposits and disputes"),
                  },
                ].map(({ href, label }) => (
                  <li key={href} className="flex items-start gap-2">
                    <span className="bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 text-sm underline underline-offset-2"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

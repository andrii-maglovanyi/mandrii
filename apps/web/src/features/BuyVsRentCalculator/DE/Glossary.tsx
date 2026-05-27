import { useI18n } from "~/i18n/useI18n";

export const Glossary = () => {
  const i18n = useI18n();

  return (
    <ul className={`text-neutral list-inside list-disc space-y-4 md:space-y-2`}>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Grunderwerbsteuer (Transfer Tax)")}</span> -{" "}
        {i18n(
          "Germany's property purchase tax, set independently by each federal state (Bundesland). It is a flat percentage of the full purchase price with no bands, no threshold relief, and no first-time buyer discount. Rates range from 3.5% (Bavaria & Saxony) to 6.5% (Brandenburg, NRW, Schleswig-Holstein, Saarland).",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Kaufnebenkosten (Acquisition costs)")}</span> -{" "}
        {i18n(
          "The total upfront costs on top of the purchase price: Grunderwerbsteuer (3.5-6.5%), notary & land registry fees (~1.5-2%), and the buyer's share of the agent commission (~1.785-3.57%). Combined, these typically amount to 10-15% of the purchase price. This is why buying in Germany rarely makes financial sense for stays shorter than 7-10 years.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Notar & Grundbuch (Notary & Land Registry)")}</span> -{" "}
        {i18n(
          "In Germany, every property sale must be certified by a notary (Notar) who draws up the purchase contract (Kaufvertrag). The transfer of ownership is then recorded in the land register (Grundbuch), maintained by the local court. Both fees are regulated by law and together amount to roughly 1.5-2% of the purchase price.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Maklerprovision (Agent commission)")}</span> -{" "}
        {i18n(
          "Since the Maklergesetz of December 2020 (§§ 656a-656d BGB), the total agent commission must be split equally between buyer and seller. The combined commission is typically 3.57-7.14% (inclusive of 19% VAT); the buyer's share is usually 1.785-3.57%. If the seller instructs the agent, they pay at least half.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Zinsbindung (Fixed-rate period)")}</span> -{" "}
        {i18n(
          "German mortgages fix the interest rate for the entire Zinsbindung period - most commonly 10 or 15 years. The monthly payment is fixed for this whole period, giving more long-term certainty. 10-year fixed rates were approximately 3.2-3.6% in 2025-2026 (indicative market range; verify current rates).",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Anschlussfinanzierung (Refinancing)")}</span> -{" "}
        {i18n(
          "When the Zinsbindung period ends, the outstanding loan balance must be refinanced at whatever interest rates prevail at that time. This is a key risk in Germany: if rates have risen, your monthly payments may increase substantially. Arrangement costs (broker fee, any notarial land charge amendment, bank processing fees) are typically €500-€2,000 per refinancing event.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Beleihungsauslauf (Loan-to-Value / LTV)")}</span> -{" "}
        {i18n(
          "The mortgage amount as a percentage of the property's value. German banks apply strict lending tiers: rates are typically most favourable at or below 60% LTV, moderate between 60-80%, and significantly higher (or unavailable) above 80%. A deposit of at least 20% plus the full Kaufnebenkosten is the standard minimum requirement.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Eigenkapital (Down payment / Equity)")}</span> -{" "}
        {i18n(
          "Your own funds contributed to the purchase. German lenders generally require at least enough Eigenkapital to cover the full Kaufnebenkosten (10-15%) plus 10-20% of the purchase price - meaning a minimum of ~20-35% of the total purchase price from your own savings.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Hausgeld & WEG (Condo fee)")}</span> -{" "}
        {i18n(
          "Owners of condominiums (Eigentumswohnungen) pay a monthly Hausgeld to the Wohnungseigentümergemeinschaft (WEG - the owners' association). This covers shared building maintenance, administration, building insurance, and contributions to the Instandhaltungsrücklage (mandatory reserve fund for future major repairs). Typically €24-€48 per m² per year. Houses do not have this cost.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Grundsteuer (Property tax)")}</span> -{" "}
        {i18n(
          "Germany's annual municipal property tax, substantially reformed from January 2025. It is calculated as: assessed property value (Grundsteuerwert) × federal multiplier (Steuermesszahl) × local municipal rate (Hebesatz). The Hebesatz varies enormously between municipalities. Typical annual amounts range from €400 to €1,500+ depending on location and property size.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Kaltmiete (Cold rent)")}</span> -{" "}
        {i18n(
          "The base monthly rent excluding utilities, heating, and service charges. The total amount you pay including these additional costs is called Warmmiete. The Mietpreisbremse (§556d BGB) limits new tenancy rents to a maximum of 10% above the local reference rent (Mietspiegel) in officially designated tight-market areas.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">
          {i18n("Mietpreisbremse & Kappungsgrenze (Rent controls)")}
        </span>{" "}
        -{" "}
        {i18n(
          "Two separate legal protections for tenants. The Mietpreisbremse caps the rent on new tenancies at 10% above the local Mietspiegel reference rent in designated areas. The Kappungsgrenze (§558 BGB) caps increases within an existing tenancy at 20% over any three-year period (reduced to 15% in areas with an officially declared tight housing market - angespannter Wohnungsmarkt).",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Mietkaution (Rental deposit)")}</span> -{" "}
        {i18n(
          "By law (§551 BGB), a landlord may not demand more than 3 months' cold rent as a deposit. The deposit must be held in a separate, interest-bearing account (Mietkautionskonto) and returned to the tenant after moving out, subject to any legitimate deductions. Because this money is locked away and cannot be invested, the calculator excludes it from your investable savings while you rent.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Return on savings")}</span> -{" "}
        {i18n(
          "The estimated annual return if you invested the capital you save by not buying - your deposit, Grunderwerbsteuer, Kaufnebenkosten, and renovation budget. German Tagesgeld (instant-access savings accounts) paid around 3-3.5% in 2025; a broad equity ETF has historically returned 5-7% per year over the long run. The calculator defaults to 3.5%.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Wohngebäudeversicherung (Buildings insurance)")}</span> -{" "}
        {i18n(
          "Mandatory buildings insurance covering damage to the structure from fire, water, storm, and similar risks. Required by all mortgage lenders. For Eigentumswohnungen, this is commonly included within the Hausgeld paid to the WEG - if so, set this field to zero to avoid double-counting.",
        )}
      </li>
    </ul>
  );
};

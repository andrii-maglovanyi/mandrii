import { useI18n } from "~/i18n/useI18n";

export const Glossary = () => {
  const i18n = useI18n();

  return (
    <ul className={`text-neutral list-inside list-disc space-y-4 md:space-y-2`}>
      <li>
        <span className="text-on-surface font-semibold">
          {i18n("PCC - Podatek od czynności cywilnoprawnych (Civil-Law Transactions Tax)")}
        </span>{" "}
        -{" "}
        {i18n(
          "A 2% tax on the purchase price of residential property on the secondary market (resale). It is NOT applicable when buying from a developer (primary market, where 8% VAT applies instead). Since 31 August 2023 (Dz.U. 2023 poz. 1205), first-time buyers who have never owned any residential property anywhere are fully exempt. All co-buyers must individually qualify for the exemption to apply.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">
          {i18n("Rynek pierwotny / Rynek wtórny (Primary / Secondary market)")}
        </span>{" "}
        -{" "}
        {i18n(
          "Rynek pierwotny means buying directly from a developer (deweloper), typically a newly-built or off-plan property. The price already includes 8% VAT (for dwellings ≤150 m²; 23% for larger). No PCC applies. Rynek wtórny is a resale purchase from a private seller, subject to 2% PCC (unless FTB-exempt). Most new builds are delivered in stan deweloperski.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Stan deweloperski (Developer finish state)")}</span> -{" "}
        {i18n(
          "The standard finish state for new-build flats in Poland. The flat is handed over with structural walls, plastered, with electrical/plumbing roughed in, but with no flooring, tiles, kitchen, bathroom fittings, or paint. Buyers must budget for complete fit-out: typically 1,000-2,500 zł/m² depending on standard. For a 60 m² flat, expect 60,000-150,000 zł of additional spend before you can move in.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Taksa notarialna (Notary fee)")}</span> -{" "}
        {i18n(
          "All property purchases in Poland must be formalised by a notary (notariusz) in a notarial deed (akt notarialny). The notary fee (taksa) is regulated by the Minister of Justice on a sliding scale based on the transaction value. For a 600,000 zł property the maximum is ~4,920 zł. Additional costs: land register entry (wpis do KW) ~200 zł, PCC on the notarial act ~23 zł, mortgage hypothek registration ~200 zł. Total typically 3,000-6,000 zł.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Księga wieczysta (Land register)")}</span> -{" "}
        {i18n(
          "Poland's official electronic property register, maintained by district courts (sąd rejonowy). Every property has a KW number. Checking the KW is essential before buying - it reveals ownership, mortgages (hipoteka), easements, and other encumbrances. Ownership transfer (przeniesienie własności) must be registered in the KW after the notarial deed.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("WIBOR (Warsaw Interbank Offered Rate)")}</span> -{" "}
        {i18n(
          "The benchmark interest rate used to price most Polish variable-rate mortgages (kredyty hipoteczne ze zmiennym oprocentowaniem). The NBP reference rate was cut to 3.75% in April 2026, and WIBOR 3M was approximately 4.5% at that time. The total mortgage rate = WIBOR 3M or 6M + bank margin (~2-2.5%). WIBOR is being phased out in favour of WIRON (Warsaw Interest Rate Overnight) under the NBP reform programme.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">
          {i18n("Wkład własny (Down payment / Equity contribution)")}
        </span>{" "}
        -{" "}
        {i18n(
          "Your own funds contributed to the purchase. The KNF (Komisja Nadzoru Finansowego - Polish financial regulator) recommends a minimum 20% wkład własny. Banks may accept 10%, but below 20% typically requires mandatory mortgage insurance (ubezpieczenie niskiego wkładu własnego), which adds to the effective borrowing cost. Below 10% is rarely accepted by any lender.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("LTV / Wskaźnik LtV")}</span> -{" "}
        {i18n(
          "Loan-to-Value: the mortgage amount as a percentage of the property's value. Polish banks apply tiered pricing: ≤60% LTV gets the best rates; 60-80% is acceptable but with slightly worse margins; above 80% typically requires mortgage insurance. The KNF recommendation (Rekomendacja S) sets the maximum LTV for variable-rate mortgages.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">
          {i18n("Stałe / Zmienne oprocentowanie (Fixed / Variable rate)")}
        </span>{" "}
        -{" "}
        {i18n(
          "Variable-rate mortgages (zmienne oprocentowanie) - linked to WIBOR 3M/6M + margin - are the dominant Polish product, representing ~85% of new mortgages. Fixed-rate products (stałe oprocentowanie) fix the rate for 5 years, then revert to variable. Since 2023, banks are required to offer at least a 5-year fixed option alongside variable-rate mortgages (KNF Rekomendacja S amendment).",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Czynsz administracyjny / Wspólnota mieszkaniowa")}</span>{" "}
        -{" "}
        {i18n(
          "Monthly charges paid by flat owners to their housing association (wspólnota mieszkaniowa - for individually owned units) or housing co-operative (spółdzielnia mieszkaniowa). Covers: fundusz remontowy (mandatory building renovation fund - legally required under the Act on the Ownership of Premises), building insurance, common area electricity/cleaning/maintenance, lift, and administration fees. Typically 300-800 zł/month. Houses do not have this cost.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Fundusz remontowy (Building renovation fund)")}</span> -{" "}
        {i18n(
          "A mandatory contribution to a collective fund for major building repairs (roof, facade, lifts, common pipes). Governed by the ustawa o własności lokali (Act on the Ownership of Premises). The rate is set by the wspólnota (typically 1-5 zł/m²/month). The fund is used for large works like roof replacement, building insulation, or lift modernisation - costs that in a house would fall entirely on the owner.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Podatek od nieruchomości (Property tax)")}</span> -{" "}
        {i18n(
          "Poland's annual property tax is assessed on floor area (m²), not on property value. The maximum rate for residential buildings in 2025 is 1.19 zł/m²/year (set by the Minister of Finance). The actual rate is set by each gmina (municipality) within this maximum. For a 60 m² flat, the maximum annual tax is just ~71 zł - making this cost almost negligible.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Prowizja pośrednika (Agent commission)")}</span> -{" "}
        {i18n(
          "Commission is negotiable and market convention varies. Sellers typically pay 1.5-3% to their agent. Buyers may be charged 1.5-3% by the buyer's agent, or 0% if the agent represents only the seller. Always clarify the commission structure before engaging an agent.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Kaucja (Rental deposit)")}</span> -{" "}
        {i18n(
          "Under Art. 6 ustawy o ochronie praw lokatorów (Dz.U. 2001 Nr 71 poz. 733), the landlord may require a deposit of up to 6 months' rent (hard legal cap). Market norm is 2-3 months. There is no statutory requirement for the landlord to hold the deposit in a separate protected account. The funds are typically held by the landlord directly and returned at lease end.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Czynsz najmu (Rent)")}</span> -{" "}
        {i18n(
          "The monthly rental payment (czynsz najmu) excludes utilities and building charges (opłaty eksploatacyjne / czynsz administracyjny). In practice, total housing costs for renters include: czynsz najmu + opłaty (water, heating, building charges) + electricity. National average for a 1-bed flat: ~2,820 zł/month czynsz najmu in major cities (Numbeo, May 2026). Polish rental law (ustawa o ochronie praw lokatorów) provides moderate tenant protections but no statutory rent cap.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Return on savings (zwrot z oszczędności)")}</span> -{" "}
        {i18n(
          "The estimated annual return if you invest the capital saved by not buying - your wkład własny, PCC, notary costs, and renovation budget. Polish savings accounts (Konto Oszczędnościowe) offered 5-6% in early 2026, expected to decline toward 4-4.5% as the NBP rate-cutting cycle continues. A broadly diversified global equity ETF has historically returned ~6-7% per year over the long run. The calculator defaults to 4.5%.",
        )}
      </li>
    </ul>
  );
};

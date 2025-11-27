"use client";

import clsx from "clsx";
import { AlertCircle, Briefcase, Calendar, CheckCircle, Shield, Users } from "lucide-react";
import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { z } from "zod";

import { Alert, Card, Checkbox, Input, RichText, Select, Separator, TabPane, Tabs } from "~/components/ui";
import { useForm } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { getFlagComponent } from "~/lib/icons/flags";
import { getIcon, IconName } from "~/lib/icons/icons";
import { sendToMixpanel } from "~/lib/mixpanel";
import { getILRCalculatorSchema, ilrInitialValues } from "~/lib/validation/ilr";

type Adjustment = { reason: string; type: string; years: number };
type ILROutcome = {
  adjustments: Adjustment[];
  allRequirementsMet: boolean;
  blockingRequirements: Requirement[];
  earliestApplicationDate?: Date;
  hasCriminalBlock: boolean;
  hasStudentBlock: boolean;
  hasUkraineBlock: boolean;
  ilrDate?: Date;
  mainApplicantYears: number;
  partnerAdjustments: PartnerAdjustment[];
  partnerYears: null | number;
  requirements: Requirement[];
  visaStartDate?: Date;
  warnings: string[];
};

const ilrSchema = getILRCalculatorSchema();

type ILRValues = z.infer<typeof ilrSchema>;
type PartnerAdjustment = { reason: string; type: string; years?: number };
type Requirement = { met: boolean; text: string };

const EARLY_APPLICATION_DAYS = 28;
const ILR_APPLICATION_FEE = 3029; // GBP
type FeeBand = { durationYears?: number; fee: number; maxYears?: number };
const feeConfig = {
  categories: {
    bno: {
      ihsPerYear: 1035,
      visaBands: [{ durationYears: 5, fee: 180, maxYears: Infinity }],
    },
    family: {
      ihsPerYear: 1035,
      visaBands: [{ durationYears: 2.5, fee: 1938, maxYears: Infinity }],
    },
    "global-talent": {
      ihsPerYear: 1035,
      visaBands: [{ durationYears: 5, fee: 766, maxYears: Infinity }],
    },
    innovator: {
      ihsPerYear: 1035,
      visaBands: [{ durationYears: 3, fee: 1274, maxYears: Infinity }],
    },
    other: {
      ihsPerYear: 1035,
      visaBands: [{ durationYears: 3, fee: 625, maxYears: Infinity }],
    },
    refugee: { ihsPerYear: 0, visaBands: [{ durationYears: 5, fee: 0, maxYears: Infinity }] },
    "skilled-worker": {
      ihsPerYear: 1035,
      visaBands: [
        { durationYears: 3, fee: 769, maxYears: 3 },
        { durationYears: 5, fee: 1751, maxYears: Infinity },
      ],
    },
    "skilled-worker-care": {
      ihsPerYear: 0,
      visaBands: [
        { durationYears: 3, fee: 304, maxYears: 3 },
        { durationYears: 5, fee: 590, maxYears: Infinity },
      ],
    },
    student: {
      ihsPerYear: 1035,
      visaBands: [{ durationYears: 3, fee: 880, maxYears: Infinity }],
    },
    ukraine: { ihsPerYear: 0, visaBands: [{ durationYears: 5, fee: 0, maxYears: Infinity }] },
  },
  defaultIhsPerYear: 1035,
  defaultVisaBands: [{ durationYears: 3, fee: 625 }],
} as const;

type StepSectionProps = {
  children: React.ReactNode;
  description: string;
  icon: typeof Users;
  title: string;
};

const StepSection = ({ children, description, icon: Icon, title }: StepSectionProps) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3">
      <div className={`
        flex min-h-11 min-w-11 items-center justify-center rounded-xl
        bg-primary/10 text-primary
      `}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
        <p className="text-neutral">{description}</p>
      </div>
    </div>
    <div className="space-y-6">{children}</div>
  </div>
);

type UnionJackProps = { className?: string; style?: React.CSSProperties };

const UnionJack = ({ className, style }: UnionJackProps) => {
  const clipId = useId();
  return (
    <svg
      aria-hidden="true"
      className={className}
      height="600"
      preserveAspectRatio="xMidYMid slice"
      style={style}
      viewBox="0 0 50 30"
      width="1000"
      xmlns="http://www.w3.org/2000/svg"
    >
      <clipPath id={clipId}>
        <path d="M25,15h25v15zv15h-25zh-25v-15zv-15h25z" />
      </clipPath>
      <path d="M0,0v30h50v-30z" fill="#012169" />
      <path d="M0,0 50,30M50,0 0,30" stroke="#fff" strokeWidth="6" />
      <path clipPath={`url(#${clipId})`} d="M0,0 50,30M50,0 0,30" stroke="#C8102E" strokeWidth="4" />
      <path d="M-1 11h22v-12h8v12h22v8h-22v12h-8v-12h-22z" fill="#C8102E" stroke="#FFF" strokeWidth="2" />
    </svg>
  );
};

export const ILRCalculator = () => {
  const i18n = useI18n();

  const steps = [
    { icon: Users, key: "visa", value: i18n("Visa") },
    { icon: Briefcase, key: "income", value: i18n("Income") },
    { icon: Shield, key: "compliance", value: i18n("Compliance") },
  ] as const;

  const [activeStep, setActiveStep] = useState<string>(steps[0].key);
  const [formError, setFormError] = useState<null | string>(null);
  const [formWarning, setFormWarning] = useState<null | string>(null);
  const [formInfo, setFormInfo] = useState<null | string>(null);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const CountryFlag = getFlagComponent("UA");

  const visaOptions = useMemo(
    () =>
      [
        { label: i18n("Ukraine Schemes"), value: "ukraine" },
        { iconName: "GraduationCap", label: i18n("Student / Graduate"), value: "student" },
        { iconName: "Briefcase", label: i18n("Skilled Worker"), value: "skilled-worker" },
        { iconName: "Users", label: i18n("Family (Partner / Parent)"), value: "family" },
        { iconName: "Heart", label: i18n("Health & Care Worker"), value: "skilled-worker-care" },
        { iconName: "LifeBuoy", label: i18n("Refugee / Asylum"), value: "refugee" },
        { iconName: "Globe", label: i18n("Global Talent"), value: "global-talent" },
        { iconName: "Lightbulb", label: i18n("Innovator Founder"), value: "innovator" },
        { iconName: "Crown", label: i18n("British National (Overseas)"), value: "bno" },
      ].map((option) => ({
        ...option,
        label: (
          <div className="flex items-center gap-3">
            {option.value === "ukraine" && CountryFlag ? (
              <CountryFlag className="h-3 w-4 rounded-xs" />
            ) : (
              getIcon(option.iconName as IconName)
            )}{" "}
            {option.label}
          </div>
        ),
      })),
    [i18n, CountryFlag],
  );
  const entryOptions = useMemo(
    () => [
      { label: i18n("Legal entry with valid visa"), value: "legal" },
      { label: i18n("Initially on visitor visa"), value: "visitor" },
      { label: i18n("Irregular entry (small boat, etc)"), value: "illegal" },
    ],
    [i18n],
  );
  const occupationLevelOptions = useMemo(
    () => [
      { label: i18n("RQF Level 6+"), value: "RQF6+" },
      { label: i18n("RQF Level 3-5"), value: "RQF3-5" },
    ],
    [i18n],
  );
  const englishLevelOptions = useMemo(
    () => [
      { label: i18n("Below B2 (not eligible)"), value: "below-B2" },
      { label: i18n("B2 - Upper Intermediate"), value: "B2" },
      { label: i18n("C1 - Advanced"), value: "C1" },
      { label: i18n("C2 - Proficient"), value: "C2" },
    ],
    [i18n],
  );
  const partnerWorkOptions = useMemo(
    () => [
      { label: i18n("Working (£50k+ annual income)"), value: "working-high" },
      { label: i18n("Working (under £50k)"), value: "working-low" },
      { label: i18n("Not working / Stay-at-home parent"), value: "not-working" },
    ],
    [i18n],
  );
  const refugeeTypeOptions = useMemo(
    () => [
      { label: i18n("In-country asylum claim (after UK arrival)"), value: "in-country" },
      { label: i18n("Resettled refugee / humanitarian scheme"), value: "resettled" },
    ],
    [i18n],
  );
  const penaltyYearsOptions = useMemo(
    () => [
      { label: i18n("5 years (min)"), value: "5" },
      { label: i18n("10 years"), value: "10" },
      { label: i18n("15 years"), value: "15" },
      { label: i18n("20 years (max)"), value: "20" },
    ],
    [i18n],
  );
  const volunteeringReductionOptions = useMemo(
    () => [
      { label: i18n("3 years (min)"), value: "3" },
      { label: i18n("5 years (max)"), value: "5" },
    ],
    [i18n],
  );
  const { getFieldProps, handleChange, values } = useForm<typeof ilrSchema.shape>({
    initialValues: { ...ilrInitialValues, incomeHistory: [...ilrInitialValues.incomeHistory] },
    schema: ilrSchema,
  });

  const numberFieldProps = <K extends keyof ILRValues>(field: K) => {
    const props = getFieldProps(field);
    return {
      ...props,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormError(null);
        const raw = e.target.value;
        const numeric = raw === "" ? undefined : Number(raw);
        handleChange(field)(numeric);
      },
      value: props.value === "" || props.value === null || props.value === undefined ? "" : Number(props.value),
    };
  };

  const selectNumberFieldProps = <K extends keyof ILRValues>(field: K) => {
    const props = getFieldProps(field);
    return {
      ...props,
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormError(null);
        const raw = e.target.value;
        handleChange(field)(raw === "" ? undefined : Number(raw));
      },
      value: props.value === "" || props.value === null || props.value === undefined ? "" : String(props.value),
    };
  };

  const [result, setResult] = useState<ILROutcome | null>(null);

  const computeOutcome = useCallback(
    (currentValues: ILRValues) => {
      const visaStartDate = currentValues.visaStartDate ? new Date(currentValues.visaStartDate) : undefined;
      const arrivalDate = currentValues.arrivalDate ? new Date(currentValues.arrivalDate) : undefined;
      const baseDate = visaStartDate ?? arrivalDate;
      const selectedCategory = currentValues.visaCategory;
      const isBNO = selectedCategory === "bno";
      const isGlobalTalent = selectedCategory === "global-talent";
      const isInnovatorFounder = selectedCategory === "innovator";
      const refugeeRoute = selectedCategory === "refugee";
      const isUkraine = selectedCategory === "ukraine";
      const entryMethod = refugeeRoute || isUkraine ? "legal" : currentValues.entryMethod;

      if (!baseDate) return null;

      const baselineYears = 10;
      const adjustments: Adjustment[] = [];
      const warnings: string[] = [];

      const income = parseFloat(currentValues.currentIncome || "0") || 0;
      const incomeYears = Math.max(0, currentValues.incomeYears ?? 0);
      const reductionCandidates: Adjustment[] = [];
      const addReductionCandidate = (years: number, reason: string) =>
        reductionCandidates.push({ reason, type: "reduction", years });

      if (isBNO) {
        addReductionCandidate(5, i18n("British National (Overseas) status"));
      }

      if (isGlobalTalent || isInnovatorFounder) {
        addReductionCandidate(7, i18n("Global Talent/Innovator Founder route"));
      }

      if (currentValues.isBritishPartner) {
        addReductionCandidate(5, i18n("Partner of British citizen"));
      }

      if (income >= 125_140 && incomeYears < 3) {
        warnings.push(
          i18n("Income £125,140+ reductions require at least 3 years at that level. Reduction not applied."),
        );
      } else if (income >= 125_140 && incomeYears >= 3) {
        addReductionCandidate(7, i18n("Annual income £125,140+"));
      } else if (income >= 50_270 && incomeYears < 3) {
        warnings.push(i18n("High income reductions require at least 3 years at that level. Reduction not applied."));
      } else if (income >= 50_270 && incomeYears >= 3) {
        addReductionCandidate(5, i18n("Annual income £50,270-£125,140"));
      }

      if (
        currentValues.isPublicService &&
        Math.max(0, currentValues.publicServiceYears ?? 0) >= 5 &&
        currentValues.occupationLevel === "RQF6+"
      ) {
        addReductionCandidate(5, i18n("Public service employment (5+ years at RQF6+)"));
      }

      if (currentValues.englishLevel === "C1" || currentValues.englishLevel === "C2") {
        addReductionCandidate(1, i18n("Advanced English (C1/C2 level)"));
      }

      if (currentValues.hasVolunteering) {
        const volunteeringReduction = Math.min(
          5,
          Math.max(3, Number(currentValues.volunteeringReductionYears ?? volunteeringReductionOptions[0].value)),
        );
        addReductionCandidate(volunteeringReduction, i18n("Community volunteering (minus 3-5 years)"));
        warnings.push(i18n("Volunteering reduction is consultative and subject to how contribution is measured"));
      }

      const bestReduction = reductionCandidates.sort((a, b) => b.years - a.years)[0] ?? null;

      let baseYears = baselineYears;
      let baseFloor = baselineYears;
      let hasFloorOverride = false;
      const baselineIncreaseAdjustments: Adjustment[] = [];

      const registerBaselineFloor = (minYears: number, reason: string) => {
        if (minYears > baseFloor) {
          baseFloor = minYears;
          hasFloorOverride = true;
          baselineIncreaseAdjustments.push({ reason, type: "baseline", years: minYears });
        }
      };

      if (
        (currentValues.visaCategory === "skilled-worker" || currentValues.visaCategory === "skilled-worker-care") &&
        currentValues.occupationLevel === "RQF3-5"
      ) {
        registerBaselineFloor(15, i18n("Skilled Worker/Health & Care role below RQF6 (fixed 15-year baseline)"));
        warnings.push(
          i18n(
            "The 15-year baseline for roles below RQF6 is a consultation option (not final policy). Check for updates.",
          ),
        );
      }

      if (refugeeRoute) {
        if (currentValues.refugeeType === "in-country") {
          registerBaselineFloor(20, i18n("In-country asylum seeker (core protection route)"));
        } else if (currentValues.refugeeType === "resettled" || currentValues.refugeeType === "") {
          registerBaselineFloor(10, i18n("Resettled refugee route"));
        } else {
          registerBaselineFloor(10, i18n("Refugee route (baseline)"));
        }
      }

      const penaltyAdjustments: Adjustment[] = [];

      if (entryMethod === "illegal") {
        const years = Math.min(20, Math.max(0, Number(currentValues.illegalPenaltyYears ?? 20)));
        penaltyAdjustments.push({
          reason: i18n("Illegal entry to UK (up to 20 years)"),
          type: "penalty",
          years,
        });
      }

      if (entryMethod === "visitor") {
        const years = Math.min(20, Math.max(0, Number(currentValues.visitorPenaltyYears ?? 20)));
        penaltyAdjustments.push({
          reason: i18n("Original entry on visitor visa (up to 20 years)"),
          type: "penalty",
          years,
        });
      }

      if (currentValues.hasOverstayed && (currentValues.overstayMonths ?? 0) >= 6) {
        const years = Math.min(20, Math.max(0, Number(currentValues.overstayPenaltyYears ?? 20)));
        penaltyAdjustments.push({
          reason: i18n("Overstayed visa by 6+ months (up to 20 years)"),
          type: "penalty",
          years,
        });
      }

      if (currentValues.claimedBenefits) {
        const penalty = (currentValues.benefitsMonths ?? 0) >= 12 ? 10 : 5;
        penaltyAdjustments.push({
          reason:
            penalty === 10 ? i18n("Claimed public funds for 12+ months") : i18n("Claimed public funds for <12 months"),
          type: "penalty",
          years: penalty,
        });
      }

      const bestPenalty = penaltyAdjustments.sort((a, b) => b.years - a.years)[0] ?? null;
      const baseStart = Math.max(baseFloor, baselineYears);
      const penaltyYears = bestPenalty?.years ?? 0;
      const reductionYears = bestReduction?.years ?? 0;

      const combinedYears = baseStart + penaltyYears - reductionYears;

      if (hasFloorOverride) {
        baseYears = Math.max(baseFloor, Math.max(3, combinedYears));
      } else {
        baseYears = Math.max(3, combinedYears);
      }
      adjustments.push(...baselineIncreaseAdjustments);
      if (bestPenalty) adjustments.push(bestPenalty);
      if (bestReduction) adjustments.push(bestReduction);

      if (refugeeRoute) {
        const refugeeFloor = currentValues.refugeeType === "in-country" ? 20 : 10;
        if (baseYears < refugeeFloor) {
          warnings.push(
            i18n("Refugee routes have a minimum baseline of {years} years regardless of reductions.", {
              years: refugeeFloor,
            }),
          );
          baseYears = refugeeFloor;
        }
      }

      const incomeRequirementMet = refugeeRoute ? true : income >= 12_570 && incomeYears >= 3;

      const requirements: Requirement[] = [
        { met: !currentValues.hasCriminalRecord, text: i18n("No criminal record") },
        {
          met: ["B2", "C1", "C2"].includes(currentValues.englishLevel),
          text: i18n("English language at least B2"),
        },
        { met: !!currentValues.passedLifeInUK, text: i18n("Passed Life in the UK test") },
        { met: !currentValues.hasDebts, text: i18n("No outstanding debts") },
        refugeeRoute
          ? {
              met: true,
              text: i18n("Income requirement waived for refugee routes"),
            }
          : {
              met: incomeRequirementMet,
              text: i18n("Income of £12,570+ for at least 3 years"),
            },
      ];

      if (!refugeeRoute && income >= 12_570 && incomeYears >= 3 && incomeYears < 5) {
        warnings.push(
          i18n("Income threshold duration is under consultation (3-5 years). Requirement may tighten to 5 years."),
        );
      }
      warnings.push(
        i18n(
          "Consultation runs till 12 February 2026. Timelines and requirements may change once final policy is set, I'll update this tool accordingly.",
        ),
      );

      const blockingRequirements: Requirement[] = [];
      const hasUkraineBlock = currentValues.visaCategory === "ukraine";
      const hasStudentBlock = selectedCategory === "student";
      const hasCriminalBlock = !!currentValues.hasCriminalRecord;

      if (currentValues.hasCriminalRecord) {
        blockingRequirements.push({ met: false, text: i18n("Criminal record blocks settlement eligibility") });
      }
      if (currentValues.hasDebts) {
        blockingRequirements.push({
          met: false,
          text: i18n("Outstanding government debts block settlement eligibility"),
        });
      }
      if (!refugeeRoute && (income < 12_570 || (currentValues.incomeYears ?? 0) < 3)) {
        blockingRequirements.push({
          met: false,
          text: i18n("Income below £12,570 or under 3 years at that level fails the contribution requirement"),
        });
      }

      let ilrDate: Date | undefined;
      let earliestApplicationDate: Date | undefined;
      if (baseDate) {
        ilrDate = new Date(baseDate);
        ilrDate.setFullYear(ilrDate.getFullYear() + baseYears);
        earliestApplicationDate = new Date(ilrDate);
        earliestApplicationDate.setDate(earliestApplicationDate.getDate() - EARLY_APPLICATION_DAYS);
      }

      let partnerYears: null | number = null;
      const partnerAdjustments: PartnerAdjustment[] = [];

      if (currentValues.hasPartner && !currentValues.isBritishPartner) {
        partnerYears = 10;

        if (currentValues.partnerWorkStatus === "working-high") {
          partnerYears -= 5;
          partnerAdjustments.push({
            reason: i18n("Partner earns £50,270+ (own contribution)"),
            type: "reduction",
            years: 5,
          });
        } else if (currentValues.partnerWorkStatus === "not-working") {
          partnerAdjustments.push({
            reason: i18n("Partner not working - may need 10-year route or own contribution (work or volunteering)."),
            type: "info",
          });
        }
      }

      const computeResult = {
        adjustments,
        allRequirementsMet: requirements.every((r) => r.met),
        blockingRequirements,
        earliestApplicationDate,
        hasCriminalBlock,
        hasStudentBlock,
        hasUkraineBlock,
        ilrDate,
        mainApplicantYears: baseYears,
        partnerAdjustments,
        partnerYears,
        requirements,
        visaStartDate,
        warnings,
      };

      sendToMixpanel("Computed ILR Outcome", {
        computeResult,
        currentValues,
        source: "ilr_calculator",
      });

      return computeResult;
    },
    [i18n, volunteeringReductionOptions],
  );

  useEffect(() => {
    const parsed = ilrSchema.safeParse(values);
    if (!parsed.success) {
      setResult(null);
      setFormError(null);
      setFormWarning(i18n("Complete required fields to see your estimate."));
      setFormInfo(null);
      return;
    }

    const outcome = computeOutcome(parsed.data);
    if (!outcome) {
      setResult(null);
      setFormError(null);
      setFormWarning(null);
      setFormInfo(i18n("Add your visa type and start date to get an estimate."));
      return;
    }

    if (outcome.hasUkraineBlock) {
      setResult(null);
      setFormWarning(null);
      setFormInfo(null);
      setFormError(i18n("Ukraine Scheme currently does not lead to ILR. No settlement route available."));
      return;
    }

    if (outcome.hasStudentBlock) {
      setResult(null);
      setFormWarning(null);
      setFormInfo(null);
      setFormError(
        i18n(
          "Student visas do not lead to ILR under the new earned settlement system. You must switch to an eligible visa (such as Skilled Worker or Family visa) first. Only time spent on settlement-eligible routes counts toward the 10-year qualifying period. The old 10-year long residence route has been abolished.",
        ),
      );
      return;
    }

    if (outcome.hasCriminalBlock) {
      setResult(null);
      setFormWarning(null);
      setFormInfo(null);
      setFormError(
        i18n(
          "Criminal record blocks settlement under proposed rules. The Home Office plans a full review of criminality thresholds.",
        ),
      );
      return;
    }

    if (outcome.blockingRequirements.length > 0) {
      setResult(null);
      setFormWarning(null);
      setFormInfo(null);
      setFormError(
        i18n("Blocking issues prevent an ILR timeline until resolved (e.g., {issue})", {
          issue: outcome.blockingRequirements[0]?.text ?? i18n("Unmet requirement"),
        }),
      );
      return;
    }

    setFormError(null);
    setFormWarning(null);
    setFormInfo(null);
    setResult(outcome);
  }, [i18n, values, computeOutcome]); // auto-calculate on any change

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatDateSafe = (d?: Date) => (d ? formatDate(d) : i18n("Not set"));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-GB", {
      currency: "GBP",
      maximumFractionDigits: 0,
      style: "currency",
    }).format(value);

  const getFeeBands = (category?: ILRValues["visaCategory"]) => {
    const cat = category ? feeConfig.categories[category as keyof typeof feeConfig.categories] : undefined;
    return {
      ihsPerYear: cat?.ihsPerYear ?? feeConfig.defaultIhsPerYear,
      visaBands: cat?.visaBands ?? feeConfig.defaultVisaBands,
    };
  };

  const renderStep = (step: string) => {
    switch (step) {
      case "compliance":
        return (
          <StepSection
            description={i18n("Language, and compliance with UK laws and regulations.")}
            icon={Shield}
            title={i18n("Integration & compliance")}
          >
            <div className={`
              my-8 grid
              md:grid-cols-2 md:gap-4
            `}>
              <Select
                {...getFieldProps("englishLevel")}
                label={i18n("English language level")}
                options={englishLevelOptions}
                placeholder={i18n("Select level")}
              />
              <div className={`
                mt-0
                md:mt-7
              `}>
                <Checkbox {...getFieldProps("passedLifeInUK")} label={i18n("I have passed the Life in the UK test")} />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-on-surface">{i18n("Compliance questions")}</h3>
              <Checkbox {...getFieldProps("hasCriminalRecord")} label={i18n("I have a criminal record in the UK")} />
              <Checkbox
                {...getFieldProps("hasDebts")}
                label={i18n("I have outstanding debts to the UK government (NHS, tax, etc.)")}
              />
              <div className={clsx(values.hasOverstayed ? `
                -m-4 mb-8 rounded-lg bg-neutral/10 p-4 pb-0
              ` : "")}>
                <Checkbox {...getFieldProps("hasOverstayed")} label={i18n("I have overstayed my visa")} />
                {values.hasOverstayed && (
                  <div className={`
                    mt-3 grid gap-3
                    md:grid-cols-2
                  `}>
                    <Input
                      className="max-w-28"
                      {...numberFieldProps("overstayMonths")}
                      label={i18n("Overstay duration (months)")}
                      min={0}
                      type="number"
                    />
                    <Select
                      {...selectNumberFieldProps("overstayPenaltyYears")}
                      label={i18n("Penalty (in consultation - up to 20 years)")}
                      options={penaltyYearsOptions}
                      placeholder={i18n("Select penalty")}
                    />
                  </div>
                )}
              </div>

              <div
                className={clsx(
                  "space-y-3",
                  values.claimedBenefits ? `
                    -m-4 mb-8 rounded-lg bg-neutral/10 p-4 pb-0
                  ` : "",
                )}
              >
                <Checkbox
                  {...getFieldProps("claimedBenefits")}
                  label={i18n("I have claimed public funds (benefits)")}
                />
                {values.claimedBenefits && (
                  <Input
                    className="max-w-28"
                    {...numberFieldProps("benefitsMonths")}
                    label={i18n("Duration of benefits (months)")}
                    min={0}
                    type="number"
                  />
                )}
              </div>
            </div>
          </StepSection>
        );

      case "income":
        return (
          <StepSection
            description={i18n("Your occupation, income and volunteering details.")}
            icon={Briefcase}
            title={i18n("Employment & income")}
          >
            <div className={`
              my-8 grid gap-4
              md:grid-cols-2
            `}>
              <Input
                {...getFieldProps("currentIncome")}
                label={i18n("Current annual income (before tax)")}
                placeholder={i18n("e.g., 35000")}
                type="number"
              />
              <Input
                {...numberFieldProps("incomeYears")}
                className="max-w-28"
                label={i18n("Years at/above this income (min 3 years)")}
                max={20}
                min={0}
                type="number"
              />

              <Select
                {...getFieldProps("occupationLevel")}
                label={i18n("Occupation level")}
                options={occupationLevelOptions}
                placeholder={i18n("Select level")}
              />
            </div>

            <div className={clsx(values.isPublicService ? `
              -m-4 mb-8 rounded-lg bg-neutral/10 p-4 pb-0
            ` : "")}>
              <Checkbox
                {...getFieldProps("isPublicService")}
                label={i18n("I work in public services (NHS, teaching, etc.)")}
              />
              {values.isPublicService && (
                <div className="mt-3 max-w-xs">
                  <Input
                    className="max-w-28"
                    {...numberFieldProps("publicServiceYears")}
                    label={i18n("Years in public service")}
                    max={40}
                    min={0}
                    type="number"
                  />
                </div>
              )}
            </div>

            <div className={clsx(values.hasVolunteering ? `
              -m-4 mb-4 rounded-lg bg-neutral/10 p-4 pb-0
            ` : "")}>
              <Checkbox {...getFieldProps("hasVolunteering")} label={i18n("I do community volunteering")} />
              {values.hasVolunteering && (
                <div className={`
                  mt-3 grid gap-3
                  md:grid-cols-2
                `}>
                  <Input
                    className="max-w-28"
                    {...numberFieldProps("volunteeringHours")}
                    label={i18n("Approximate total volunteering hours")}
                    placeholder={i18n("e.g., 500")}
                    type="number"
                  />
                  <Select
                    {...selectNumberFieldProps("volunteeringReductionYears")}
                    label={i18n("Apply volunteering reduction (3-5 years)")}
                    options={volunteeringReductionOptions}
                    placeholder={i18n("Select reduction")}
                  />
                </div>
              )}
            </div>
          </StepSection>
        );

      case "visa":
        return (
          <StepSection
            description={i18n("Choose your visa category, start date and optionally your family details")}
            icon={Users}
            title={i18n("Visa & family")}
          >
            <div className={`
              mt-8 grid gap-4
              md:grid-cols-2
            `}>
              <Select
                {...getFieldProps("visaCategory")}
                label={i18n("Visa category")}
                options={visaOptions}
                placeholder={i18n("Select your visa category")}
              />
              <Input label={i18n("Visa start date")} {...getFieldProps("visaStartDate")} type="date" />
            </div>

            <div className={`
              grid gap-4
              md:grid-cols-2
            `}>
              <Input label={i18n("Actual arrival in the UK")} {...getFieldProps("arrivalDate")} type="date" />
              {values.visaCategory === "refugee" ? (
                <Select
                  {...getFieldProps("refugeeType")}
                  label={i18n("Type of refugee status")}
                  options={refugeeTypeOptions}
                  placeholder={i18n("Select type")}
                />
              ) : values.visaCategory === "ukraine" ? null : (
                <Select
                  {...getFieldProps("entryMethod")}
                  label={i18n("How did you enter the UK?")}
                  options={entryOptions}
                />
              )}
            </div>

            {values.entryMethod === "illegal" && (
              <div className="mt-3 max-w-xs">
                <Select
                  {...selectNumberFieldProps("illegalPenaltyYears")}
                  label={i18n("Penalty to apply (consultation cap: up to 20 years)")}
                  options={penaltyYearsOptions}
                  placeholder={i18n("Select penalty")}
                />
              </div>
            )}

            {values.entryMethod === "visitor" && (
              <div className="mt-3 max-w-xs">
                <Select
                  {...selectNumberFieldProps("visitorPenaltyYears")}
                  label={i18n("Penalty to apply (consultation cap: up to 20 years)")}
                  options={penaltyYearsOptions}
                  placeholder={i18n("Select penalty")}
                />
              </div>
            )}

            <div className={clsx(values.hasPartner ? `
              -m-4 mb-8 rounded-lg bg-neutral/10 p-4 pb-0
            ` : "")}>
              <Checkbox {...getFieldProps("hasPartner")} label={i18n("I have a partner/spouse")} />
              {values.hasPartner && (
                <div className="space-y-3">
                  <Checkbox {...getFieldProps("isBritishPartner")} label={i18n("My partner is a British citizen")} />
                  {!values.isBritishPartner && (
                    <Select
                      {...getFieldProps("partnerWorkStatus")}
                      label={i18n("Partner's work status")}
                      options={partnerWorkOptions}
                      placeholder={i18n("Select status")}
                    />
                  )}
                </div>
              )}
            </div>

            <div className={clsx(values.hasChildren ? `
              -m-4 mb-4 rounded-lg bg-neutral/10 p-4 pb-0
            ` : "")}>
              <Checkbox {...getFieldProps("hasChildren")} label={i18n("I have children")} />
              {values.hasChildren && (
                <div className="mt-3 max-w-xs">
                  <Input
                    className="max-w-28"
                    {...numberFieldProps("numberOfChildren")}
                    label={i18n("Number of children")}
                    min={0}
                    type="number"
                  />
                </div>
              )}
            </div>
          </StepSection>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      className={`
        mx-auto h-max overflow-hidden rounded-3xl
        md:border-2 md:border-primary md:bg-surface md:shadow-xl
      `}
    >
      <div className={`
        relative z-10 overflow-hidden rounded-3xl px-2 py-6
        sm:py-9
        md:rounded-none md:px-8 md:py-12
      `}>
        <div className={`
          pointer-events-none absolute inset-0 -z-10 overflow-hidden
        `}>
          <UnionJack
            className={`
              absolute top-1/2 left-0 h-[140%] w-[70%] -translate-y-1/2
              transform opacity-15
            `}
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
        <div className={`
          z-50 flex items-start gap-3
          md:py-2
          lg:py-6
        `}>
          <div
            className={`
              flex min-h-12 min-w-12 items-center justify-center rounded-2xl
              bg-primary text-surface shadow-md
            `}
          >
            <Calendar className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h1 className={`
              text-xl font-bold text-on-surface
              md:text-2xl
              lg:text-3xl
            `}>
              {i18n("UK Earned Settlement (ILR)")}
            </h1>
            <p className={`max-w-4xl text-neutral`}>
              {i18n("Check your ILR timeline and costs based on the Earned Settlement rules.")}
            </p>
          </div>
        </div>
      </div>

      <div className={`
        space-y-6 px-4 pt-4
        md:px-12 md:py-8
      `}>
        <Tabs activeKey={activeStep} onChange={(tab) => setActiveStep(tab)}>
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <TabPane
                icon={isMobile ? null : <Icon className="mr-2 h-4 w-4" />}
                key={s.key}
                label={s.value}
                tab={s.key}
              >
                {renderStep(s.key)}
              </TabPane>
            );
          })}
        </Tabs>

        <Separator align="center" text={i18n("Results ↓")} variant="full" />

        {formError && (
          <Alert className="w-full" variant="error">
            {formError}
          </Alert>
        )}
        {formWarning && (
          <Alert className="w-full" variant="warning">
            {formWarning}
          </Alert>
        )}
        {formInfo && (
          <Alert className="w-full" variant="info">
            {formInfo}
          </Alert>
        )}

        {result && (
          <div className={`
            space-y-3
            md:space-y-4
          `}>
            {result.blockingRequirements.length > 0 && (
              <Alert variant="error">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-on-surface">{i18n("Blocking suitability issues detected")}</span>
                  <ul className="list-inside list-disc space-y-1">
                    {result.blockingRequirements.map((b) => (
                      <li key={b.text}>{b.text}</li>
                    ))}
                  </ul>
                  <span className="leading-snug text-on-surface/80">
                    {i18n("These issues prevent settlement until resolved. The timeline shown is indicative only.")}
                  </span>
                </div>
              </Alert>
            )}

            {result.blockingRequirements.length === 0 && !result.allRequirementsMet && (
              <Alert variant="warning">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-on-surface">
                    {i18n("Some non-blocking requirements are not met")}
                  </span>
                </div>
              </Alert>
            )}

            <Alert className="w-full" variant={result.allRequirementsMet ? "success" : "info"}>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-on-surface">
                  {i18n("Estimated earliest ILR date")}: {formatDateSafe(result.ilrDate)}
                </span>
                <span className="leading-snug text-on-surface/80">
                  {i18n("Based on the information you entered and the current consultation proposals")}
                </span>
              </div>
            </Alert>

            <div className={`
              grid gap-3
              md:gap-4
              lg:grid-cols-3
            `}>
              <div
                className={`
                  rounded-xl border border-neutral-disabled bg-surface/70 px-4
                  py-3 shadow-sm
                  md:px-5 md:py-4
                `}
              >
                <p className="font-semibold text-neutral uppercase">{i18n("Main applicant")}</p>
                <p className="mt-1 text-3xl font-semibold text-on-surface">
                  {i18n("{years} years", { years: result.mainApplicantYears })}
                </p>
                <p className="mt-1 text-neutral">
                  {i18n("Visa start date")}: {formatDateSafe(result.visaStartDate)}
                </p>
                <p className="text-neutral">
                  {i18n("Target ILR date")}: {formatDateSafe(result.ilrDate)}
                </p>
                <p className="font-semibold text-on-surface">
                  {i18n("Earliest application (28-day rule)")}: {formatDateSafe(result.earliestApplicationDate)}
                </p>
              </div>

              <div
                className={`
                  rounded-xl border border-neutral-disabled bg-surface/70 px-4
                  py-3 shadow-sm
                  md:px-5 md:py-4
                  lg:col-span-2
                `}
              >
                <p className={`mb-2 font-semibold text-neutral uppercase`}>{i18n("Key requirements")}</p>
                <ul className="space-y-1.5">
                  {result.requirements.map((r) => (
                    <li className="flex items-center gap-2" key={r.text}>
                      {r.met ? (
                        <CheckCircle className={`
                          max-h-4 min-h-4 max-w-4 min-w-4 text-green-600
                        `} />
                      ) : (
                        <AlertCircle className={`
                          max-h-4 min-h-4 max-w-4 min-w-4 text-red-500
                        `} />
                      )}
                      <span className={r.met ? "text-on-surface" : `
                        font-semibold text-red-700
                      `}>{r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {result.partnerYears !== null && (
              <div
                className={`
                  rounded-xl border border-neutral-disabled bg-surface/70 px-4
                  py-3 shadow-sm
                  md:px-5 md:py-4
                `}
              >
                <p className={`mb-1 font-semibold text-neutral uppercase`}>{i18n("Partner (dependant)")}</p>
                <p className="text-lg font-semibold text-on-surface">
                  {i18n("Approx. {years} years", { years: result.partnerYears })}
                </p>
                <p className="mb-2 text-neutral">
                  {i18n(
                    "Dependants are assessed separately under the proposals, even if the main applicant qualifies earlier.",
                  )}
                </p>
                {(!result.allRequirementsMet || result.blockingRequirements.length > 0) && (
                  <p className="font-semibold text-red-700">
                    {i18n("Dependants can only apply if the main applicant meets all requirements.")}
                  </p>
                )}
                {result.partnerAdjustments.length > 0 && (
                  <ul className="list-inside list-disc text-neutral">
                    {result.partnerAdjustments.map((p, idx) => (
                      <li key={idx}>
                        {p.reason}{" "}
                        {typeof p.years === "number"
                          ? `(${p.type === "reduction" ? "-" : "+"}${p.years} ${i18n("years")})`
                          : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {values.hasChildren && (
              <div
                className={`
                  rounded-xl border border-neutral-disabled bg-surface/70 px-4
                  py-3 shadow-sm
                  md:px-5 md:py-4
                `}
              >
                <p className={`mb-1 font-semibold text-neutral uppercase`}>{i18n("Children (dependants)")}</p>
                <p className="text-lg font-semibold text-on-surface">
                  {i18n("{count} children", { count: values.numberOfChildren ?? 0 })}
                </p>
                <div className="mt-4 space-y-1 text-neutral">
                  <RichText as="p">
                    {i18n("**Under 18**: can usually get settlement at the same time as the main applicant.")}
                  </RichText>
                  <RichText as="p">
                    {i18n(
                      "**18 or over**: must have been a dependant before turning 18, not be living independently, and meet the English (B1) and Life in the UK requirements. They can apply with you or after you're settled.",
                    )}
                  </RichText>
                  <p className="mt-4 text-sm">
                    {i18n(
                      "If both parents are in the UK, children normally wait until both apply or are settled. They can apply with just one parent only if that parent has sole responsibility or there are serious or compelling reasons.",
                    )}
                  </p>
                </div>
              </div>
            )}

            {result.adjustments.length > 0 && (
              <div className={`
                rounded-xl bg-neutral/10 px-4 py-3
                md:px-5 md:py-4
              `}>
                <h3 className="mb-1 font-semibold text-on-surface">{i18n("How your waiting time was adjusted")}</h3>
                <ul className={`
                  list-inside list-disc space-y-1 text-sm text-neutral
                `}>
                  {result.adjustments.map((a, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">
                        {a.type === "reduction"
                          ? i18n("Reduction")
                          : a.type === "penalty"
                            ? i18n("Penalty")
                            : i18n("Baseline change")}
                        :
                      </span>{" "}
                      {a.reason} ({a.years} {i18n("years")})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.warnings.length > 0 && (
              <Alert variant="warning">
                <div className="space-y-1">
                  <p className="font-semibold text-on-surface">{i18n("Warning")}</p>
                  <ul className={`
                    list-inside list-disc space-y-1 leading-snug text-on-surface
                  `}>
                    {result.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              </Alert>
            )}

            {(() => {
              const dependentCount =
                (values.hasPartner && !values.isBritishPartner ? 1 : 0) +
                (values.hasChildren ? (values.numberOfChildren ?? 0) : 0);
              const peopleCount = 1 + dependentCount;
              const estimatedFee = ILR_APPLICATION_FEE * peopleCount;
              const { ihsPerYear, visaBands } = getFeeBands(values.visaCategory);
              const baseDate = result.visaStartDate ?? (values.arrivalDate ? new Date(values.arrivalDate) : null);
              const today = new Date();
              const yearsElapsed =
                baseDate && !Number.isNaN(baseDate.getTime())
                  ? Math.max(0, (today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
                  : 0;
              const remainingYearsMainExact = Math.max(0, result.mainApplicantYears - yearsElapsed);
              const remainingYearsPartnerExact =
                result.partnerYears !== null ? Math.max(0, result.partnerYears - yearsElapsed) : null;
              const remainingYearsMain = Math.ceil(remainingYearsMainExact);
              const childrenCount = values.hasChildren ? (values.numberOfChildren ?? 0) : 0;

              const computeVisaCost = (remainingExact: number) => {
                if (remainingExact < 1) return 0;
                const remaining = Math.ceil(remainingExact);
                const band =
                  visaBands.find(
                    (b) => typeof (b as FeeBand).maxYears === "number" && remaining <= (b as FeeBand).maxYears!,
                  ) ?? (visaBands[visaBands.length - 1] as FeeBand);
                const appsNeeded = Math.max(
                  1,
                  Math.ceil(remaining / Math.max(band.durationYears ?? (remaining || 1), 1)),
                );
                return band.fee * appsNeeded;
              };

              const perPersonVisaRemaining = computeVisaCost(remainingYearsMainExact);
              const perPersonIhsRemaining = remainingYearsMainExact < 1 ? 0 : ihsPerYear * remainingYearsMain;

              const partnerVisaRemaining =
                remainingYearsPartnerExact !== null ? computeVisaCost(remainingYearsPartnerExact) : 0;
              const partnerIhsRemaining =
                remainingYearsPartnerExact !== null && remainingYearsPartnerExact >= 1
                  ? ihsPerYear * Math.ceil(remainingYearsPartnerExact)
                  : 0;

              const childrenVisaRemaining = computeVisaCost(remainingYearsMainExact) * childrenCount;
              const childrenIhsRemaining =
                remainingYearsMainExact < 1 ? 0 : ihsPerYear * Math.ceil(remainingYearsMainExact) * childrenCount;

              const householdVisaRemaining = perPersonVisaRemaining + partnerVisaRemaining + childrenVisaRemaining;
              const householdIhsRemaining = perPersonIhsRemaining + partnerIhsRemaining + childrenIhsRemaining;
              return (
                <div className={`
                  rounded-xl bg-on-surface/5 px-4 py-3
                  md:px-5 md:py-4
                `}>
                  <p className="font-semibold text-neutral uppercase">{i18n("Fees snapshot (2025 rates)")}</p>
                  <RichText className="mt-1 text-on-surface">
                    {i18n("&bull; Indicative ILR application fee (per person): **{fee}**", {
                      fee: formatCurrency(ILR_APPLICATION_FEE),
                    })}
                  </RichText>
                  <RichText className="text-on-surface">
                    {i18n("&bull; Estimated total for your household: **{fee}** (based on {count} applicants)", {
                      count: peopleCount,
                      fee: formatCurrency(estimatedFee),
                    })}
                  </RichText>
                  {perPersonVisaRemaining === 0 && perPersonIhsRemaining === 0 ? (
                    <p className="mt-2 text-sm text-primary">
                      {i18n(
                        "You have less than 1 year until ILR, assuming that no further visa/IHS renewals expected before applying.",
                      )}
                    </p>
                  ) : (
                    <>
                      <p className={`mt-8 text-sm font-semibold text-on-surface`}>
                        {i18n("Estimated remaining visa fees (per person): {fee}", {
                          fee: formatCurrency(perPersonVisaRemaining),
                        })}
                      </p>
                      <RichText className="text-neutral">
                        {i18n("Household visa fees remaining: **{fee}**", {
                          fee: formatCurrency(householdVisaRemaining),
                        })}
                      </RichText>
                      <p className={`mt-8 text-sm font-semibold text-on-surface`}>
                        {i18n("Estimated remaining IHS (per person): {fee}", {
                          fee: formatCurrency(perPersonIhsRemaining),
                        })}
                      </p>
                      <RichText className="text-neutral">
                        {i18n("Household IHS remaining: **{fee}**", {
                          fee: formatCurrency(householdIhsRemaining),
                        })}
                      </RichText>
                    </>
                  )}
                  <div className={`
                    mt-3 flex items-end justify-end border-t
                    border-neutral-disabled/60 pt-3
                  `}>
                    <div className="text-right">
                      <p className="text-neutral uppercase">{i18n("Total estimated cost")}</p>
                      <p className="text-xl font-semibold text-on-surface">
                        {formatCurrency(estimatedFee + householdVisaRemaining + householdIhsRemaining)}
                      </p>
                    </div>
                  </div>
                  <RichText className="mt-3 text-neutral">
                    {i18n(
                      "Fees are indicative (as of 2025). Check latest [GOV.UK visa/IHS/ILR fee updates]({GOV_UK_FEE_UPDATES_URL}).",

                      {
                        GOV_UK_FEE_UPDATES_URL:
                          "https://www.gov.uk/government/publications/visa-regulations-revised-table/home-office-immigration-and-nationality-fees-9-april-2025",
                      },
                    )}
                  </RichText>
                </div>
              );
            })()}

            <RichText className="mt-4 text-neutral">
              {i18n(
                "This calculator is based on the Home Office [A Fairer Pathway to Settlement]({FAIRER_PATHWAY_URL}) consultation (earned settlement, baseline 10 years, with reductions/penalties).<br/>**It is for illustration only** and does not guarantee eligibility.<br/><br/>Always check the latest official rules and consider getting professional legal advice before applying.",
                {
                  FAIRER_PATHWAY_URL:
                    "https://assets.publishing.service.gov.uk/media/691edda450b16caf978153d8/Command_Paper_final_-_reviewed7.pdf",
                },
              )}
            </RichText>
          </div>
        )}

        <div className="py-5">
          <p className="mb-2 font-semibold text-neutral uppercase">{i18n("Glossary")}</p>
          <ul className={`
            list-inside list-disc space-y-4 text-neutral
            md:space-y-2
          `}>
            <li>
              <span className="font-semibold text-on-surface">ILR / Earned Settlement</span> -{" "}
              {i18n(
                "permission to remain in the UK without time limits. The earned route can take between 3 and 30 years.",
              )}
            </li>
            <li>
              <span className="font-semibold text-on-surface">Skilled Worker visa</span> -{" "}
              {i18n(
                "employer-sponsored work visa. The draft sets a baseline of 10 years, reducible to 5 or 3 years depending on salary.",
              )}
            </li>
            <li>
              <span className="font-semibold text-on-surface">RQF Level 6+</span> -{" "}
              {i18n(
                "jobs that require a university-level qualification, such as a Bachelor's degree (Level 6), Master's degree (Level 7), or PhD (Level 8).",
              )}
            </li>
            <li>
              <span className="font-semibold text-on-surface">RQF Level 3-5</span> -{" "}
              {i18n(
                "A-levels are Level 3, and things like Foundation degrees, HNCs and HNDs are Levels 4-5. Lower-skill roles usually follow the longer 15-year ILR route.",
              )}
            </li>
            <li>
              <span className="font-semibold text-on-surface">Life in the UK Test</span> -{" "}
              {i18n(
                "required culture/values test before settlement. It's short multiple-choice quiz about British history, culture and everyday life.",
              )}
            </li>
            <li>
              <span className="font-semibold text-on-surface">B2 / C1 English</span> -{" "}
              {i18n("you need at least B2, but C1 can speed things up by a year.")}
            </li>
            <li>
              <span className="font-semibold text-on-surface">Public funds</span> -{" "}
              {i18n(
                "UK benefits (like Universal Credit or housing support). Using them can add 5-10 years to your settlement timeline.",
              )}
            </li>
            <li>
              <span className="font-semibold text-on-surface">BN(O)</span> -{" "}
              {i18n("a special British National (Overseas) visa with a 5-year path to settlement.")}
            </li>
            <li>
              <span className="font-semibold text-on-surface">NRPF</span> -{" "}
              {i18n("No Recourse to Public Funds, meaning you can't claim most UK benefits.")}
            </li>
            <li>
              <span className="font-semibold text-on-surface">Community volunteering</span> -{" "}
              {i18n(
                "helping your local area in a genuine, unpaid way - like working in a charity shop (Oxfam, Cancer Research UK, British Heart Foundation), helping at a food bank, joining park clean-ups, or supporting a community centre.",
              )}
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

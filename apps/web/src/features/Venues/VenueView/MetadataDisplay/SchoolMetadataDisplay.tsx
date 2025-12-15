import { BookOpen, GraduationCap, Languages, Monitor, Users } from "lucide-react";
import { useLocale } from "next-intl";

import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { GetPublicVenuesQuery, Locale } from "~/types";

import { MetadataChips, MetadataRow, MetadataSection } from "./MetadataSection";

interface SchoolMetadataDisplayProps {
  schoolDetails: GetPublicVenuesQuery["venues"][number]["venue_school_details"][number];
}

export const SchoolMetadataDisplay = ({ schoolDetails }: SchoolMetadataDisplayProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const { age_groups, class_size_max, languages_taught, online_classes_available, subjects } = schoolDetails ?? {};

  const hasAgeGroups = age_groups && age_groups.length > 0;
  const hasLanguages = languages_taught && languages_taught.length > 0;
  const hasSubjects = subjects && subjects.length > 0;
  const hasClassInfo = class_size_max || online_classes_available !== undefined;

  if (!hasAgeGroups && !hasLanguages && !hasSubjects && !hasClassInfo) return null;

  return (
    <div className="space-y-6">
      {hasAgeGroups && (
        <MetadataSection icon={Users} title={i18n("Age groups")}>
          <MetadataChips
            items={(age_groups as (typeof constants.options.AGE_GROUPS)[number]["value"][]).map(
              (ageGroup) =>
                constants.options.AGE_GROUPS.find((option) => option.value === ageGroup)?.label[locale] || ageGroup,
            )}
          />
        </MetadataSection>
      )}

      {(hasSubjects || hasClassInfo) && (
        <MetadataSection icon={BookOpen} title={i18n("Class details")}>
          {hasSubjects && (
            <MetadataRow
              icon={GraduationCap}
              label={i18n("Subjects")}
              showDots
              value={(subjects as (typeof constants.options.CURRICULUM)[number]["value"][])
                .map(
                  (subject) =>
                    constants.options.CURRICULUM.find((option) => option.value === subject)?.label[locale] || subject,
                )
                .join(", ")}
            />
          )}
          {class_size_max && (
            <MetadataRow icon={Users} label={i18n("Maximum class size")} showDots value={class_size_max} />
          )}
          {online_classes_available !== undefined && (
            <MetadataRow
              icon={Monitor}
              label={i18n("Online classes")}
              showDots
              value={
                <span className={`inline-flex items-center gap-1 text-green-600 dark:text-green-400`}>
                  ✓ {i18n("Available")}
                </span>
              }
            />
          )}
        </MetadataSection>
      )}
      {hasLanguages && (
        <MetadataSection icon={Languages} title={i18n("Languages taught")}>
          <MetadataChips
            items={(languages_taught as (typeof constants.options.LANGUAGES)[number]["value"][]).map(
              (language) =>
                constants.options.LANGUAGES.find((option) => option.value === language)?.label[locale] || language,
            )}
          />
        </MetadataSection>
      )}
    </div>
  );
};

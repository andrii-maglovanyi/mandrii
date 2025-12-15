import { BookOpen, Languages, Users } from "lucide-react";
import { useLocale } from "next-intl";
import { useCallback } from "react";

import { Checkbox, Input, Separator } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { VenueFormData, VenueSchema } from "~/lib/validation/venue";
import { Locale } from "~/types";

type VenueSchoolDetails = NonNullable<VenueFormData["venue_school_details"]>;
type VenueSchoolDetailsProps = Pick<FormProps<VenueSchema["shape"]>, "setValues" | "values">;

export const VenueSchoolDetails = ({ setValues, values }: VenueSchoolDetailsProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const schoolData = values.venue_school_details ?? {};

  const updateSchoolData = useCallback(
    (updates: Partial<VenueSchoolDetails>) => {
      setValues((prev) => {
        const currentSchoolDetails = prev.venue_school_details ?? {};

        return {
          ...prev,
          venue_school_details: {
            ...currentSchoolDetails,
            ...updates,
          },
        };
      });
    },
    [setValues],
  );

  const toggleAgeGroup = useCallback(
    (ageGroup: (typeof constants.options.AGE_GROUPS)[number]["value"]) => {
      const currentGroups = schoolData.age_groups || [];
      const newGroups = currentGroups.includes(ageGroup)
        ? currentGroups.filter((g) => g !== ageGroup)
        : [...currentGroups, ageGroup];

      updateSchoolData({ age_groups: newGroups });
    },
    [schoolData.age_groups, updateSchoolData],
  );

  const toggleLanguage = useCallback(
    (language: (typeof constants.options.LANGUAGES)[number]["value"]) => {
      const currentLanguages = schoolData.languages_taught || [];
      const newLanguages = currentLanguages.includes(language)
        ? currentLanguages.filter((l) => l !== language)
        : [...currentLanguages, language];

      updateSchoolData({ languages_taught: newLanguages });
    },
    [schoolData.languages_taught, updateSchoolData],
  );

  const toggleSubject = useCallback(
    (subject: (typeof constants.options.CURRICULUM)[number]["value"]) => {
      const currentSubjects = schoolData.subjects || [];
      const newSubjects = currentSubjects.includes(subject)
        ? currentSubjects.filter((s) => s !== subject)
        : [...currentSubjects, subject];

      updateSchoolData({ subjects: newSubjects });
    },
    [schoolData.subjects, updateSchoolData],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Users size={20} />
          {i18n("Age groups")}
        </h3>

        <div className={`
          grid grid-cols-1 gap-3
          md:grid-cols-2
        `}>
          {constants.options.AGE_GROUPS.map((group) => (
            <Checkbox
              checked={(schoolData.age_groups || []).includes(group.value)}
              key={group.value}
              label={group.label[locale]}
              onChange={() => {
                toggleAgeGroup(group.value);
              }}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Languages size={20} />
          {i18n("Languages taught")}
        </h3>

        <div className={`
          grid grid-cols-1 gap-3
          md:grid-cols-2
          lg:grid-cols-3
        `}>
          {constants.options.LANGUAGES.map((language) => (
            <Checkbox
              checked={(schoolData.languages_taught || []).includes(language.value)}
              key={language.value}
              label={language.label[locale]}
              onChange={() => {
                toggleLanguage(language.value);
              }}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen size={20} />
          {i18n("Subjects")}
        </h3>

        <div className={`
          grid grid-cols-1 gap-3
          md:grid-cols-2
          lg:grid-cols-3
        `}>
          {constants.options.CURRICULUM.map((subject) => (
            <Checkbox
              checked={(schoolData.subjects || []).includes(subject.value)}
              key={subject.value}
              label={i18n(subject.label[locale])}
              onChange={() => {
                toggleSubject(subject.value);
              }}
            />
          ))}
        </div>

        <div className={`
          grid grid-cols-1 gap-4
          md:grid-cols-2
        `}>
          <Input
            label={i18n("Maximum class size")}
            min={1}
            onChange={(e) => {
              updateSchoolData({ class_size_max: Number.parseInt(e.target.value) || undefined });
            }}
            placeholder="15"
            type="number"
            value={schoolData.class_size_max || ""}
          />

          <div className="flex items-center pt-6">
            <Checkbox
              checked={schoolData.online_classes_available || false}
              label={i18n("Online classes")}
              onChange={(e) => {
                updateSchoolData({ online_classes_available: e.target.checked });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

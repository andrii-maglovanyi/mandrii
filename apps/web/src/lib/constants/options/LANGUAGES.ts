export const LANGUAGES = [
  { label: { en: "Ukrainian", uk: "Українська" }, value: "ukrainian" },
  { label: { en: "English", uk: "Англійська" }, value: "english" },
  { label: { en: "Local language", uk: "Місцева мова" }, value: "local_language" },
  {
    label: { en: "Bilingual (Ukrainian + English)", uk: "Двомовна (українська + англійська)" },
    value: "bilingual_ukr_eng",
  },
  {
    label: { en: "Bilingual (Ukrainian + local)", uk: "Двомовна (українська + місцева)" },
    value: "bilingual_ukr_local",
  },
] as const;

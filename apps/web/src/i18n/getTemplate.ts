import { createTranslator } from "next-intl";

import { englishPlurals } from "./englishPlurals";
import { normalizeTranslationMessages } from "./normalizeTranslationMessages";

const translateEnglish = createTranslator({
  locale: "en",
  messages: normalizeTranslationMessages(englishPlurals) as Record<string, string>,
  onError: (error) => { throw error; },
});

export const getTemplate = (template: string, options?: Record<string, Date | number | string>) => {
  if (!options) return template;

  if (Object.hasOwn(englishPlurals, template)) {
    try {
      return translateEnglish(template.replaceAll(".", "_"), options);
    } catch {
      // Preserve unresolved placeholders for callers providing partial values.
    }
  }

  return template.replace(/\{([^{}]+)\}/g, (_, key) => {
    const value = options[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
};

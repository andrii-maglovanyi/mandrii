type TranslationMessages = Record<string, unknown>;

/**
 * `next-intl` treats periods as message-path separators, while Mandrii's
 * translation catalogues use the English source string as a flat key. Keep
 * the runtime catalogue in the same normalized form used by `useI18n` and
 * `getI18n`.
 */
export const normalizeTranslationMessages = (messages: TranslationMessages): TranslationMessages => {
  const normalized: TranslationMessages = {};

  for (const [key, value] of Object.entries(messages)) {
    const normalizedKey = key.replaceAll(".", "_");

    if (Object.prototype.hasOwnProperty.call(normalized, normalizedKey)) {
      throw new Error(`Translation key collision after normalization: ${normalizedKey}`);
    }

    normalized[normalizedKey] = value;
  }

  return normalized;
};

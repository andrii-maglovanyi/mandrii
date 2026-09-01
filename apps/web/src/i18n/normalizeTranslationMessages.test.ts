import ukMessages from "../../translations/uk.json";
import { createTranslator } from "next-intl";
import { describe, expect, it } from "vitest";

import { normalizeTranslationMessages } from "./normalizeTranslationMessages";

describe("normalizeTranslationMessages", () => {
  it("makes sentence-style translation keys available to the normalized i18n lookup", () => {
    const messages = normalizeTranslationMessages(ukMessages);
    const t = createTranslator({ locale: "uk", messages });
    const translate = t as unknown as (key: string) => string;

    expect(translate("Preparing your settlement route___")).toBe("Готуємо ваш план облаштування...");
  });

  it("rejects ambiguous keys", () => {
    expect(() => normalizeTranslationMessages({ "One.two": "A", One_two: "B" })).toThrow(
      "Translation key collision after normalization: One_two",
    );
  });
});

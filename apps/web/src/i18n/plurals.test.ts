import { renderHook } from "@testing-library/react";
import { createTranslator } from "next-intl";
import { beforeEach, expect, it, vi } from "vitest";

import ukrainian from "../../translations/uk.json";
import { englishPlurals } from "./englishPlurals";
import { getI18n } from "./getI18n";
import { getTemplate } from "./getTemplate";
import { normalizeTranslationMessages } from "./normalizeTranslationMessages";
import { useI18n } from "./useI18n";

const state = vi.hoisted(() => ({ locale: "en" }));
const translateUk = createTranslator({ locale: "uk", messages: normalizeTranslationMessages(ukrainian) });
vi.mock("next-intl", async (original) => ({
  ...(await original<object>()),
  useLocale: () => state.locale,
  useTranslations: () => translateUk,
}));
vi.mock("next-intl/server", () => ({ getTranslations: async () => translateUk }));
beforeEach(() => { state.locale = "en"; });

it.each([[0, "0 events"], [1, "1 event"], [2, "2 events"], [5, "5 events"], [21, "21 events"], [1.5, "1.5 events"]])(
  "formats English event counts consistently on client and server: %s", async (count, expected) => {
    const { result } = renderHook(() => useI18n());
    expect(result.current("{count} events", { count })).toBe(expected);
    expect((await getI18n({ locale: "en" }))("{count} events", { count })).toBe(expected);
  },
);

it.each([[0, "0 подій"], [1, "1 подія"], [2, "2 події"], [5, "5 подій"], [11, "11 подій"], [21, "21 подія"], [22, "22 події"], [25, "25 подій"]])(
  "preserves the Ukrainian catalogue's plural rules: %s", async (count, expected) => {
    state.locale = "uk";
    const { result } = renderHook(() => useI18n());
    expect(result.current("{count} events", { count })).toBe(expected);
    expect((await getI18n({ locale: "uk" }))("{count} events", { count })).toBe(expected);
  },
);

it("handles irregular nouns and preserves other interpolated values", () => {
  expect(getTemplate("{count} children", { count: 1 })).toBe("1 child");
  expect(getTemplate("{count} children", { count: 2 })).toBe("2 children");
  expect(getTemplate("{number} countries", { number: 1 })).toBe("1 country");
  expect(getTemplate("{points} points to {level}", { level: "Helper", points: 1 })).toBe("1 point to Helper");
  expect(getTemplate("Maximum is {MAX_IMAGES} images.", { MAX_IMAGES: 1 })).toBe("Maximum is 1 image.");
});

it("preserves plain messages and unresolved placeholders", () => {
  expect(getTemplate("Hello {name}", { name: "Sam" })).toBe("Hello Sam");
  expect(getTemplate("{count} events")).toBe("{count} events");
  expect(getTemplate("{count} events", {})).toBe("{count} events");
});

it.each(Object.keys(englishPlurals))("validates the English ICU message: %s", (key) => {
  const values = { count: 1, fee: "£10", level: "Helper", MAX_IMAGES: 1, number: 1, points: 1, sign: "+", years: 1 };
  const translate = createTranslator({ locale: "en", messages: { message: englishPlurals[key] }, onError: (error) => { throw error; } });
  expect(getTemplate(key, values)).toBe(translate("message", values));
});

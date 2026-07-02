import { defineRouting } from "next-intl/routing";

// Add "ko", "zh-CN", "zh-TW" here (plus a messages/<locale>.json file)
// to ship additional languages.
export const routing = defineRouting({
  locales: ["en", "ja"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
};

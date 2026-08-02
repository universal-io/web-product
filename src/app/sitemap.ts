import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://universal-io.com";
// /vision and /v2 are deliberately absent: they are design references kept in
// the repo, not pages we want indexed or found by visitors.
const paths = [
  "",
  "/pricing",
  "/company",
  "/privacy",
  "/terms",
  "/commerce-disclosure",
];

function urlFor(locale: string, path: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${BASE_URL}${prefix}${path}` || BASE_URL;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: urlFor(locale, path),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? (locale === routing.defaultLocale ? 1 : 0.8) : 0.4,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, urlFor(l, path)]),
        ),
      },
    })),
  );
}

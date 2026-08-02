import type { Metadata } from "next";
import localFont from "next/font/local";
import { LINE_Seed_JP } from "next/font/google";
import { getTranslations } from "next-intl/server";

// Universal I/O vision route — a self-contained visual world.
// Fonts here are scoped to this route only (do not affect the main site).
const generalSans = localFont({
  src: "../../../fonts/GeneralSans-Variable.woff2",
  variable: "--font-vision-sans",
  weight: "200 700",
  display: "swap",
});

const lineSeedJp = LINE_Seed_JP({
  variable: "--font-vision-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vision.meta" });
  const path = locale === "en" ? "/vision" : `/${locale}/vision`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: path,
      languages: {
        en: "/vision",
        ja: "/ja/vision",
        "x-default": "/vision",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: path,
      siteName: "Universal I/O",
      type: "website",
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    twitter: {
      card: "summary",
      title: t("title"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function VisionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${generalSans.variable} ${lineSeedJp.variable} vision-scope`}>
      {children}
    </div>
  );
}

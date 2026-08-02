import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Nav from "@/components/Nav";
import Problem from "@/components/Problem";
import WhatItDoes from "@/components/WhatItDoes";
import Demo from "@/components/Demo";
import UseCases from "@/components/UseCases";
import WhyNow from "@/components/WhyNow";
import Principles from "@/components/Principles";
import SymbolSystem from "@/components/SymbolSystem";
import Trust from "@/components/Trust";
import IOMachine from "@/components/IOMachine";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "productPage" });
  return { title: `${t("title")} — Universal I/O`, description: t("subtitle") };
}

// Everything the home page no longer shows lives here, unchanged. The home page
// carries only what is finished; this page keeps the rest reachable and intact
// so sections can be moved back up one at a time as they are reworked.
export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("productPage");

  return (
    <>
      <Nav />
      <main>
        <header className="mx-auto w-full max-w-[1120px] px-5 pt-14 sm:px-10 sm:pt-20">
          <div className="mb-[18px] font-mono text-xs uppercase tracking-[0.12em] text-iris">
            {t("kicker")}
          </div>
          <h1 className="max-w-[18ch] text-balance text-[32px] font-semibold leading-[1.14] tracking-[-0.03em] sm:text-[40px] lg:text-[44px] lg:leading-[1.1]">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-[62ch] text-[15px] leading-[1.75] text-body sm:text-base">
            {t("subtitle")}
          </p>
        </header>

        <Problem />
        <WhatItDoes />
        <Demo />
        <UseCases />
        <WhyNow />
        <Principles />
        <SymbolSystem />
        <Trust />
        <IOMachine />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

import { setRequestLocale } from "next-intl/server";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import WhatItDoes from "@/components/WhatItDoes";
import Demo from "@/components/Demo";
import UseCases from "@/components/UseCases";
import WhyNow from "@/components/WhyNow";
import Principles from "@/components/Principles";
import SymbolSystem from "@/components/SymbolSystem";
import Trust from "@/components/Trust";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Nav />
      <main>
        <Hero />

        {/* divider */}
        <div className="mx-auto flex max-w-[1120px] items-center gap-5 px-5 sm:px-10">
          <div className="h-px flex-1 bg-hair" />
          <span className="font-mono text-xs tracking-[0.1em] text-ghost">
            I//O
          </span>
          <div className="h-px flex-1 bg-hair" />
        </div>

        <Problem />
        <WhatItDoes />
        <Demo />
        <UseCases />
        <WhyNow />
        <Principles />
        <SymbolSystem />
        <Trust />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

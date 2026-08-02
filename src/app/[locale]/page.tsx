import { setRequestLocale } from "next-intl/server";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Capabilities from "@/components/Capabilities";
import SymbolSystem from "@/components/SymbolSystem";
import Principles from "@/components/Principles";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";

// The home page shows only the finished sections. Everything else is kept
// intact on /product and moves back here as it is reworked.
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
        {/* No divider between these two: the section below is grey against the
            hero's white, so the edge is already there. */}
        <Capabilities />
        <SymbolSystem />
        <Principles />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

import { setRequestLocale } from "next-intl/server";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Capabilities from "@/components/Capabilities";
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

        {/* divider */}
        <div className="mx-auto flex max-w-[1120px] items-center gap-5 px-5 sm:px-10">
          <div className="h-px flex-1 bg-hair" />
          <span className="font-mono text-xs tracking-[0.1em] text-ghost">
            I//O
          </span>
          <div className="h-px flex-1 bg-hair" />
        </div>

        <Capabilities />
      </main>
      <Footer />
    </>
  );
}

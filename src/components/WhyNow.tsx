import { useTranslations } from "next-intl";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

export default function WhyNow() {
  const t = useTranslations("whyNow");
  const tools = t.raw("tools") as string[];

  return (
    <section className="mx-auto max-w-[1120px] px-5 py-[72px] sm:px-10 sm:py-[110px]">
      <SectionHeader
        kicker={t("kicker")}
        title={t("title")}
        body={t("body")}
        wide
      />

      {/* layer map */}
      <Reveal delay={120} className="mt-12 flex flex-col items-center sm:mt-16">
        <div className="flex items-center gap-2.5 rounded-full border border-line bg-white px-6 py-[11px] shadow-[0_1px_2px_rgba(16,17,20,0.04)]">
          <span className="h-2 w-2 rounded-full bg-coral" />
          <span className="text-[15px] font-medium">{t("humanInput")}</span>
        </div>
        <div className="dash-v h-9 w-px" />
        <div className="io-pulse-soft flex w-full max-w-[880px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-ink px-5 py-[22px] sm:flex-row sm:gap-3.5">
          <span className="text-2xl font-semibold tracking-[-0.01em] text-white">
            I<span className="text-iris">{"//"}</span>O
          </span>
          <span className="text-center font-mono text-xs uppercase tracking-[0.1em] text-faint">
            {t("layerSub")}
          </span>
        </div>
        <div className="flex w-full max-w-[880px] justify-around">
          <div className="dash-v h-9 w-px" />
          <div className="dash-v hidden h-9 w-px sm:block" />
          <div className="dash-v hidden h-9 w-px sm:block" />
          <div className="dash-v h-9 w-px" />
        </div>
        <div className="flex max-w-[880px] flex-wrap justify-center gap-2.5">
          {tools.map((tool) => (
            <span
              key={tool}
              className="rounded-full border border-line bg-paper px-[18px] py-[9px] text-sm font-medium text-body"
            >
              {tool}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

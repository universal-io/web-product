import { useTranslations } from "next-intl";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

export default function Principles() {
  const t = useTranslations("principles");
  const items = t.raw("items") as { title: string; body: string }[];

  return (
    <section id="principles" className="scroll-mt-16 border-y border-hair bg-paper">
      <div className="mx-auto max-w-[1120px] px-5 py-[72px] sm:px-10 sm:py-[110px]">
        <SectionHeader kicker={t("kicker")} title={t("title")} />

        <Reveal delay={100} className="mt-10 border-t border-edge sm:mt-12">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="grid grid-cols-[48px_1fr] items-baseline gap-x-4 gap-y-2 border-b border-edge py-6 sm:py-[26px] lg:grid-cols-[80px_280px_1fr] lg:gap-6"
            >
              <span className="font-mono text-[13px] text-iris">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[19px] font-semibold">{item.title}</h3>
              <p className="col-span-2 text-[15px] leading-[1.6] text-body sm:text-base lg:col-span-1">
                {item.body}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

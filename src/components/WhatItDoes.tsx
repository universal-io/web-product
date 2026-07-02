import { useTranslations } from "next-intl";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

export default function WhatItDoes() {
  const t = useTranslations("product");
  const cards = t.raw("cards") as { title: string; body: string }[];

  const card = (index: number, delay: number) => (
    <Reveal
      key={index}
      delay={delay}
      className="rounded-[18px] border border-line bg-white p-6 transition-colors duration-300 hover:border-iris sm:p-7"
    >
      <div className="mb-4 font-mono text-[13px] text-iris">
        {String(index + 1).padStart(2, "0")}
      </div>
      <h3 className="mb-2 text-[19px] font-semibold tracking-[-0.01em]">
        {cards[index].title}
      </h3>
      <p className="text-[15px] leading-relaxed text-body">
        {cards[index].body}
      </p>
    </Reveal>
  );

  return (
    <section
      id="product"
      className="border-y border-hair bg-paper scroll-mt-16"
    >
      <div className="mx-auto max-w-[1120px] px-5 py-[72px] sm:px-10 sm:py-[110px]">
        <SectionHeader
          kicker={t("kicker")}
          title={t("title")}
          body={t("body")}
        />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {card(0, 0)}
          {card(1, 60)}
          <Reveal
            delay={120}
            className="flex min-h-[120px] items-center justify-center rounded-[18px] bg-ink p-7"
          >
            <span className="text-[44px] font-semibold tracking-[-0.02em] text-white">
              I<span className="io-scan">{"//"}</span>O
            </span>
          </Reveal>
          {card(2, 180)}
          {card(3, 240)}
          {card(4, 300)}
        </div>
      </div>
    </section>
  );
}

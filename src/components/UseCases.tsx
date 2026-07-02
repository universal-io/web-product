import { useTranslations } from "next-intl";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

type Card = {
  tag: string;
  title: string;
  before: string;
  after: string;
  bullets: string[];
  witty?: string;
};

export default function UseCases() {
  const t = useTranslations("useCases");
  const cards = t.raw("cards") as Card[];

  return (
    <section id="use-cases" className="scroll-mt-16 border-y border-hair bg-paper">
      <div className="mx-auto max-w-[1120px] px-5 py-[72px] sm:px-10 sm:py-[110px]">
        <SectionHeader kicker={t("kicker")} title={t("title")} />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal
              key={c.tag}
              delay={i * 60}
              className="flex flex-col gap-3.5 rounded-[18px] border border-line bg-white p-6 sm:p-7"
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
                {c.tag}
              </div>
              <h3 className="text-balance text-xl font-semibold leading-[1.3] tracking-[-0.01em]">
                {c.title}
              </h3>
              <div className="rounded-[10px] bg-paper px-3.5 py-3 font-mono text-xs leading-[1.7] text-slate">
                <span className="text-coral line-through">{c.before}</span>
                <br />
                <span className="text-iris">{"//"}</span> {c.after}
              </div>
              <ul className="m-0 list-disc pl-[18px] text-sm leading-[1.8] text-body">
                {c.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              {c.witty && (
                <div className="mt-auto text-[13px] font-semibold text-coral">
                  {c.witty}
                </div>
              )}
            </Reveal>
          ))}

          <Reveal
            delay={cards.length * 60}
            className="flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-ghost p-7"
          >
            <span className="font-mono text-2xl text-ghost">I//O</span>
            <span className="text-center text-sm text-faint">
              {t("nextTitle")}
            </span>
            <a
              href="#access"
              className="text-sm font-semibold text-iris transition-colors hover:text-iris-deep"
            >
              {t("nextCta")}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

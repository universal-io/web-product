import { useTranslations } from "next-intl";
import Reveal from "./Reveal";

export default function Trust() {
  const t = useTranslations("trust");
  const bullets = t.raw("bullets") as string[];

  return (
    <section className="mx-auto max-w-[1120px] px-5 py-[72px] sm:px-10 sm:py-[110px]">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="mb-[18px] font-mono text-xs uppercase tracking-[0.12em] text-iris">
            {t("kicker")}
          </div>
          <h2 className="text-balance text-[32px] font-semibold leading-[1.14] tracking-[-0.03em] sm:text-[40px] lg:text-[44px] lg:leading-[1.12]">
            {t("title")}
          </h2>
          <p className="mt-[22px] text-base leading-[1.65] text-body sm:text-lg">
            {t("body")}
          </p>
          <p className="mt-6 text-[17px] font-semibold text-ink">
            {t("strong")}
          </p>
          <ul className="mt-6 flex list-none flex-col gap-3 p-0">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex gap-3 text-[15px] leading-normal text-body"
              >
                <span className="shrink-0 font-mono text-iris">{"//"}</span>
                {b}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* edge layer visual */}
        <Reveal delay={150} className="flex flex-col items-center">
          <div className="relative flex aspect-square w-[min(340px,82vw)] items-center justify-center rounded-full border border-dashed border-ghost">
            <span className="absolute -top-[9px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-faint sm:text-[11px]">
              {t("circleLabel")}
            </span>
            <div className="max-w-[230px] rounded-[14px] border border-line bg-paper px-5 py-[18px]">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
                {t("rawLabel")}
              </div>
              <div className="text-sm leading-normal text-ink">
                {t("rawText")}
              </div>
            </div>
          </div>
          <div className="dash-v h-[34px] w-px" />
          <div className="flex items-center gap-2.5 rounded-full border border-line bg-white px-5 py-[11px] text-center shadow-[0_1px_2px_rgba(16,17,20,0.04)]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-cyan" />
            <span className="text-[13px] font-medium sm:text-sm">
              {t("pill")}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

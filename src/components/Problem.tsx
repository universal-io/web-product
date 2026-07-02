import { useTranslations } from "next-intl";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const rotations = [
  "-rotate-[0.6deg]",
  "rotate-[0.5deg]",
  "-rotate-[0.4deg]",
  "rotate-[0.7deg]",
  "-rotate-[0.5deg]",
];

export default function Problem() {
  const t = useTranslations("problem");
  const messy = t.raw("messy") as string[];
  const systems = t.raw("systems") as string[];

  return (
    <section className="mx-auto max-w-[1120px] px-5 py-[72px] sm:px-10 sm:py-[110px]">
      <SectionHeader kicker={t("kicker")} title={t("title")} body={t("body")} />

      <div className="mt-12 grid grid-cols-1 items-center gap-8 sm:mt-16 lg:grid-cols-[1fr_auto_1fr]">
        {/* messy side */}
        <Reveal className="flex flex-col gap-3">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
            {t("writeLabel")}
          </div>
          {messy.map((m, i) => (
            <div
              key={m}
              className={`rounded-xl border border-line bg-white px-[18px] py-[13px] text-[15px] text-ink shadow-[0_1px_2px_rgba(16,17,20,0.04)] ${rotations[i % rotations.length]}`}
            >
              {m}
            </div>
          ))}
        </Reveal>

        {/* the intent gap */}
        <Reveal delay={120}>
          {/* vertical (desktop) */}
          <div className="hidden flex-col items-center gap-3.5 px-2 lg:flex">
            <div className="dash-v h-[72px] w-px" />
            <div
              className="font-mono text-xs uppercase tracking-[0.14em] text-coral"
              style={{ writingMode: "vertical-rl" }}
            >
              {t("gapLabel")}
            </div>
            <div className="dash-v h-[72px] w-px" />
          </div>
          {/* horizontal (mobile) */}
          <div className="flex items-center gap-3.5 py-2 lg:hidden">
            <div className="dash-h h-px flex-1" />
            <div className="font-mono text-xs uppercase tracking-[0.14em] text-coral">
              {t("gapLabel")}
            </div>
            <div className="dash-h h-px flex-1" />
          </div>
        </Reveal>

        {/* systems side */}
        <Reveal delay={200}>
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
            {t("systemsLabel")}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {systems.map((s) => (
              <div
                key={s}
                className="rounded-xl border border-line bg-paper px-4 py-3.5 text-sm font-medium text-body"
              >
                {s}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

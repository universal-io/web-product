"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

export default function Demo() {
  const t = useTranslations("demo");
  const fields = t.raw("out2Fields") as { k: string; v: string }[];
  const chips = t.raw("out3Chips") as string[];
  const [demoKey, setDemoKey] = useState(0);

  return (
    <section
      id="demo"
      className="mx-auto max-w-[1120px] scroll-mt-16 px-5 py-[72px] sm:px-10 sm:py-[110px]"
    >
      <SectionHeader kicker={t("kicker")} title={t("title")} body={t("body")} />

      <div className="mt-12 grid grid-cols-1 items-start gap-6 sm:mt-14 lg:grid-cols-[1fr_1.15fr]">
        {/* raw */}
        <Reveal className="rounded-[20px] border border-line bg-paper p-6 sm:p-[30px]">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
            {t("rawLabel")}
          </div>
          <p className="text-[19px] font-medium leading-[1.55] text-ink sm:text-[21px]">
            {t("raw")}
          </p>
          <div className="mt-5 flex items-center gap-2">
            <span className="h-[7px] w-[7px] rounded-full bg-coral" />
            <span className="font-mono text-xs tracking-[0.04em] text-coral">
              {t("tone")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDemoKey((k) => k + 1)}
            className="mt-7 flex cursor-pointer items-center gap-[9px] rounded-[11px] bg-iris px-[22px] py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-iris-deep"
          >
            <span className="font-mono font-semibold">{"//"}</span>
            {t("run")}
          </button>
        </Reveal>

        {/* outputs */}
        <div key={`demo-${demoKey}`} className="flex flex-col gap-3.5">
          <div
            className="io-fade-up rounded-2xl border border-line bg-white px-6 py-[22px] shadow-[0_1px_3px_rgba(16,17,20,0.05)]"
            style={{ animationDelay: "0.1s", animationDuration: "0.5s" }}
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-iris">
                {t("out1Label")}
              </span>
              <span className="h-[7px] w-[7px] rounded-full bg-cyan" />
            </div>
            <p className="text-base leading-[1.55] text-ink">{t("out1")}</p>
          </div>

          <div
            className="io-fade-up rounded-2xl border border-line bg-white px-6 py-[22px] shadow-[0_1px_3px_rgba(16,17,20,0.05)]"
            style={{ animationDelay: "0.28s", animationDuration: "0.5s" }}
          >
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-iris">
              {t("out2Label")}
            </div>
            <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
              {fields.map((f) => (
                <div key={f.k} className="rounded-[9px] bg-paper px-[13px] py-[9px]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-faint">
                    {f.k}
                  </div>
                  <div className="mt-[3px] text-[13px] font-medium">{f.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="io-fade-up rounded-2xl border border-line bg-white px-6 py-[22px] shadow-[0_1px_3px_rgba(16,17,20,0.05)]"
            style={{ animationDelay: "0.46s", animationDuration: "0.5s" }}
          >
            <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-iris">
              {t("out3Label")}
            </div>
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-edge px-3.5 py-[7px] text-[13px] font-medium text-ink"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

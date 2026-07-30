"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

// The original hero demo: one raw sentence in, structured output and a rewrite
// out. Moved off the first view when the story reel took its place, and kept
// here while the rest of the page is reworked from the top down.

type Field = { k: string; v: string; dot?: string };
type Example = {
  chip: string;
  input: string;
  meta: string;
  fields: Field[];
  rewrite: string;
  targets: string[];
};

export default function IOMachine() {
  const t = useTranslations("hero");
  const examples = t.raw("examples") as Example[];
  const [active, setActive] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const touched = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (touched.current) return;
      setActive((a) => (a + 1) % examples.length);
      setRunKey((k) => k + 1);
    }, 6500);
    return () => clearInterval(id);
  }, [examples.length]);

  const ex = examples[active];

  return (
    <section className="flex flex-col items-center px-5 pb-16 sm:px-10 sm:pb-24">
      <div className="w-full max-w-[1120px] rounded-3xl border border-line bg-paper p-4 pb-6 sm:p-8 lg:p-11 lg:pb-9">
        <div className="grid grid-cols-1 items-center gap-6 text-left lg:grid-cols-[1fr_auto_1fr] lg:gap-7">
          {/* raw input */}
          <div className="rounded-2xl border border-line bg-white px-5 py-5 shadow-[0_1px_2px_rgba(16,17,20,0.04)] sm:px-6 sm:py-[22px]">
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
              {t("rawLabel")}
            </div>
            <div className="text-[16px] font-medium leading-[1.55] text-ink sm:text-[17px]">
              “{ex.input}”
              <span
                className="io-caret ml-[3px] inline-block h-[18px] w-[2px] bg-ink"
                style={{ verticalAlign: "-3px" }}
              />
            </div>
            <div className="mt-3.5 font-mono text-[11px] tracking-[0.04em] text-coral">
              {ex.meta}
            </div>
          </div>

          {/* symbol */}
          <div className="flex items-center justify-center gap-[18px] py-1 lg:py-0">
            <div className="relative hidden h-[2px] w-[52px] rounded-[1px] bg-edge lg:block">
              <span
                className="absolute -top-[3px] left-0 h-2 w-2 rounded-full bg-iris"
                style={{ animation: "ioFlow 1.6s linear infinite" }}
              />
            </div>
            <div className="relative h-[36px] w-[2px] rounded-[1px] bg-edge lg:hidden">
              <span
                className="absolute -left-[3px] top-0 h-2 w-2 rounded-full bg-iris"
                style={{ animation: "ioFlowDown 1.6s linear infinite" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[44px] font-semibold leading-none tracking-[-0.02em] text-ink sm:text-[58px]">
                I
              </span>
              <span className="io-caret h-9 w-1 rounded-[2px] bg-iris sm:h-[46px]" />
              <span className="io-scan text-[44px] font-semibold leading-none sm:text-[58px]">
                {"//"}
              </span>
              <span className="io-ring h-9 w-9 rounded-full border-4 border-ink sm:h-[46px] sm:w-[46px] sm:border-[5px]" />
            </div>
            <div className="relative hidden h-[2px] w-[52px] rounded-[1px] bg-edge lg:block">
              <span
                className="absolute -top-[3px] left-0 h-2 w-2 rounded-full bg-cyan"
                style={{ animation: "ioFlow 1.6s 0.5s linear infinite" }}
              />
            </div>
            <div className="relative h-[36px] w-[2px] rounded-[1px] bg-edge lg:hidden">
              <span
                className="absolute -left-[3px] top-0 h-2 w-2 rounded-full bg-cyan"
                style={{ animation: "ioFlowDown 1.6s 0.5s linear infinite" }}
              />
            </div>
          </div>

          {/* structured output */}
          <div key={`run-${runKey}`} className="flex flex-col gap-2.5">
            <div
              className="io-fade-up rounded-2xl border border-line bg-white px-[18px] py-4 shadow-[0_1px_2px_rgba(16,17,20,0.04)]"
              style={{ animationDuration: "0.45s" }}
            >
              <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
                {t("outputLabel")}
              </div>
              <div className="flex flex-col gap-2">
                {ex.fields.map((f) => (
                  <div
                    key={f.k}
                    className="flex items-center justify-between gap-4 rounded-[9px] bg-paper px-3 py-2"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-slate">
                      {f.k}
                    </span>
                    <span className="flex items-center gap-[7px] text-[13px] font-medium text-ink">
                      {f.dot && (
                        <span
                          className="inline-block h-[7px] w-[7px] rounded-full"
                          style={{ background: f.dot }}
                        />
                      )}
                      {f.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="io-fade-up rounded-2xl border border-line bg-white px-[18px] py-4 shadow-[0_1px_2px_rgba(16,17,20,0.04)]"
              style={{ animationDelay: "0.12s", animationDuration: "0.45s" }}
            >
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-iris">
                {t("rewriteLabel")}
              </div>
              <div className="text-sm leading-normal text-ink">“{ex.rewrite}”</div>
            </div>
            <div
              className="io-fade-up flex flex-wrap items-center gap-2"
              style={{ animationDelay: "0.22s", animationDuration: "0.45s" }}
            >
              <span className="font-mono text-[11px] tracking-[0.06em] text-faint">
                {t("readyFor")}
              </span>
              {ex.targets.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-line bg-white px-[11px] py-1 text-xs font-medium text-body"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* example chips */}
        <div className="mt-8 flex flex-wrap justify-center gap-2.5 sm:mt-9">
          {examples.map((e, i) => (
            <button
              key={e.chip}
              type="button"
              onClick={() => {
                touched.current = true;
                setActive(i);
                setRunKey((k) => k + 1);
              }}
              className={`cursor-pointer rounded-full border px-[17px] py-[9px] text-[13px] font-medium transition-all duration-200 ${
                i === active
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-body hover:border-ink"
              }`}
            >
              {e.chip}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

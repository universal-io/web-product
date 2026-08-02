"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { BRAND_PATHS } from "@/lib/brand-icons";

// What the product does, after the reel has shown four moments of it.
//
// The centerpiece is the layer diagram: you at the top, the tools at the
// bottom, and the one dark block between them — that dark block is the
// product, and it holds exactly two cards, because the product does exactly
// two things. The cards are the section's navigation: picking one flips the
// flow direction on the connecting lines (screen → you for Vision, you →
// tools for Compose) and swaps the detail panel underneath. Until the reader
// touches it, the two sides take turns on their own.

type Branch = { tag: string; title: string; tagline: string };
type Block = { n: string; title: string; body: string; points: string[] };
/** No `slug` means no mark is available for that brand — the label stands alone. */
type Tool = { slug?: string; label: string };

type Side = "vision" | "compose";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ------------------------------------------------------------------ */
/* diagram parts                                                       */
/* ------------------------------------------------------------------ */

/**
 * A dashed connector with a dot travelling along it. The direction is the
 * point: Vision flows the screen up to you, Compose flows your words down
 * into the tools — the same line, read both ways.
 */
function FlowLine({
  dir,
  color,
  delay = 0,
  reduce,
  className = "",
}: {
  dir: "up" | "down";
  color: "iris" | "cyan";
  delay?: number;
  reduce: boolean | null;
  className?: string;
}) {
  return (
    <span className={`relative h-9 w-px ${className}`}>
      <span className="dash-v absolute inset-0" />
      {!reduce && (
        <motion.span
          key={`${dir}-${delay}`}
          initial={false}
          animate={{
            y: dir === "down" ? [0, 30] : [30, 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.2, 0.8, 1],
          }}
          className={`absolute -left-[2.5px] top-0 size-1.5 rounded-full ${
            color === "iris" ? "bg-iris" : "bg-cyan"
          }`}
        />
      )}
    </span>
  );
}

/**
 * A brand mark, in grey. Decorative — the label next to it already names the
 * tool, so screen readers are given the label alone.
 */
function BrandGlyph({ slug }: { slug?: string }) {
  const d = slug ? BRAND_PATHS[slug] : undefined;
  if (!d) return null;
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0 text-slate"
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}

function Machine({
  sel,
  onSel,
  reduce,
  t,
}: {
  sel: Side;
  onSel: (side: Side) => void;
  reduce: boolean | null;
  t: ReturnType<typeof useTranslations>;
}) {
  const branches = t.raw("machine.branches") as Branch[];
  const tools = t.raw("machine.tools") as Tool[];

  // Vision reads the screen for you: the flow comes up. Compose carries your
  // words out: the flow goes down. Colors follow the I/O convention already
  // used on /product — iris for input, cyan for output.
  const dir = sel === "vision" ? "up" : "down";
  const color = sel === "vision" ? "cyan" : "iris";

  return (
    <div className="flex flex-col items-center">
      {/* you */}
      <div className="flex items-center gap-2.5 rounded-full border border-line bg-white px-6 py-[11px] shadow-[0_1px_2px_rgba(16,17,20,0.04)]">
        <span className="h-2 w-2 rounded-full bg-coral" />
        <span className="text-[15px] font-medium">{t("machine.you")}</span>
      </div>

      <FlowLine dir={dir} color={color} reduce={reduce} />

      {/* the layer — this dark block is the product */}
      <div className="w-full max-w-[880px] rounded-2xl bg-ink p-3 sm:p-4">
        <div className="flex flex-col items-center justify-center gap-1 py-1.5 sm:flex-row sm:gap-3">
          <span className="text-xl font-semibold tracking-[-0.01em] text-white">
            I<span className="text-iris">{"//"}</span>O
          </span>
          <span className="text-center font-mono text-[10px] uppercase tracking-[0.1em] text-faint sm:text-xs">
            {t("machine.layerCaption")}
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:gap-3">
          {branches.map((branch, i) => {
            const side: Side = i === 0 ? "vision" : "compose";
            const on = sel === side;
            return (
              <button
                key={branch.tag}
                type="button"
                aria-pressed={on}
                onClick={() => onSel(side)}
                className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all duration-300 sm:p-5 ${
                  on
                    ? "border-iris/80 bg-white/[0.09] shadow-[0_0_28px_rgba(91,92,255,0.25)]"
                    : "border-white/10 bg-white/[0.04] hover:border-white/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`size-1.5 rounded-full transition-colors duration-300 ${
                      on ? "io-pulse-soft bg-iris" : "bg-white/25"
                    }`}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
                    {branch.tag}
                  </span>
                </span>
                <div
                  className={`mt-2 text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-300 sm:text-[19px] ${
                    on ? "text-white" : "text-white/70"
                  }`}
                >
                  {branch.title}
                </div>
                <div className="mt-1 text-[11px] leading-[1.5] text-white/50 sm:text-[12.5px]">
                  {branch.tagline}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* fan out to the tools */}
      <div className="flex w-full max-w-[880px] justify-around">
        <FlowLine dir={dir} color={color} delay={0.2} reduce={reduce} />
        <FlowLine dir={dir} color={color} delay={0.7} reduce={reduce} className="hidden sm:block" />
        <FlowLine dir={dir} color={color} delay={0.9} reduce={reduce} className="hidden sm:block" />
        <FlowLine dir={dir} color={color} delay={0.4} reduce={reduce} />
      </div>

      {/* Enough of them that the wall reads as "anything", not as a list of
          integrations — which is what the closing chip then says outright. */}
      <div className="flex max-w-[880px] flex-wrap justify-center gap-2">
        {tools.map((tool) => (
          <span
            key={tool.label}
            className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12.5px] font-medium text-body"
          >
            <BrandGlyph slug={tool.slug} />
            {tool.label}
          </span>
        ))}
      </div>
      <div className="mt-2 rounded-full border border-dashed border-edge px-[18px] py-[9px] text-sm font-medium text-slate">
        {t("machine.toolsMore")}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* detail figures                                                      */
/* ------------------------------------------------------------------ */

function Chrome({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-line bg-paper px-3 py-2">
      <span className="flex gap-1">
        <span className="size-2 rounded-full bg-edge" />
        <span className="size-2 rounded-full bg-edge" />
        <span className="size-2 rounded-full bg-edge" />
      </span>
      <span className="truncate rounded border border-line bg-white px-2 py-0.5 font-mono text-[9px] text-slate">
        {label}
      </span>
    </div>
  );
}

function PanelHead({ app, hotkey }: { app: string; hotkey: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-iris" />
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate">
          {app}
        </span>
      </span>
      <span className="font-mono text-[9px] text-faint">{hotkey}</span>
    </div>
  );
}

function Bars({ widths }: { widths: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      {widths.map((w, i) => (
        <span key={i} className="h-1.5 rounded-full bg-hair" style={{ width: w }} />
      ))}
    </div>
  );
}

/** Vision: a screen with one thing lit, and the answer sitting over it. */
function ReadFigure({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_20px_rgba(16,17,20,0.06)]">
      <Chrome label={t("figures.read.url")} />
      <div className="p-4 pb-24 sm:pb-28">
        <div className="relative rounded-lg border border-coral/60 bg-coral/[0.06] px-3 py-2.5">
          <span className="pointer-events-none absolute -inset-1 rounded-[10px] ring-2 ring-coral/70" />
          <div className="flex gap-2">
            <span className="mt-[5px] size-1.5 shrink-0 rounded-full bg-coral" />
            <p className="text-[11px] leading-[1.55] text-body">
              {t("figures.read.notice")}
            </p>
          </div>
        </div>
        <div className="mt-5 opacity-40">
          <Bars widths={["92%", "74%", "84%"]} />
        </div>
      </div>

      <div className="absolute bottom-4 right-4 w-[74%] max-w-[280px] rounded-xl border border-line bg-white/95 p-3 shadow-[0_10px_32px_rgba(16,17,20,0.16)] backdrop-blur-xl">
        <PanelHead app={t("figures.read.app")} hotkey={t("figures.read.hotkey")} />
        <p className="mt-2.5 text-[11.5px] leading-[1.65] text-ink">
          {t("figures.read.answer")}
        </p>
      </div>
    </div>
  );
}

/** Compose: the panel with a reply already written in it. */
function ComposeFigure({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_2px_20px_rgba(16,17,20,0.06)] sm:p-5">
      <PanelHead app={t("figures.compose.app")} hotkey={t("figures.compose.hotkey")} />

      <div className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-slate">
        {t("figures.compose.draftLabel")}
      </div>
      <div className="mt-2 rounded-xl border border-iris/40 bg-iris/[0.04] px-3.5 py-3">
        <p className="text-[12.5px] leading-[1.7] text-ink">
          {t("figures.compose.draft")}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-lg border border-edge bg-paper px-3 py-1.5">
          <span className="io-pulse-soft size-1.5 rounded-full bg-coral" />
          <span className="font-mono text-[10px] text-slate">
            {t("figures.compose.voice")}
          </span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-1.5">
          <span className="font-mono text-[10px] text-white">
            {t("figures.compose.send")}
          </span>
        </span>
      </div>

      <div className="mt-5 border-t border-hair pt-4 opacity-45">
        <Bars widths={["64%", "48%"]} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the section                                                         */
/* ------------------------------------------------------------------ */

export default function Capabilities() {
  const t = useTranslations("capabilities");
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });

  const blocks = t.raw("blocks") as Block[];
  const branches = t.raw("machine.branches") as Branch[];

  const [sel, setSel] = useState<Side>("vision");
  const touched = useRef(false);

  // The two sides take turns until the reader picks one themselves.
  useEffect(() => {
    if (reduce || !inView) return;
    const id = setInterval(() => {
      if (touched.current) return;
      setSel((s) => (s === "vision" ? "compose" : "vision"));
    }, 7000);
    return () => clearInterval(id);
  }, [reduce, inView]);

  const pick = (side: Side) => {
    touched.current = true;
    setSel(side);
  };

  const idx = sel === "vision" ? 0 : 1;
  const block = blocks[idx];
  const branch = branches[idx];

  return (
    <section id="what" className="scroll-mt-16 border-y border-hair bg-paper">
      <div className="mx-auto max-w-[1120px] px-5 py-[72px] sm:px-10 sm:py-[110px]">
        <SectionHeader kicker={t("kicker")} title={t("title")} body={t("lead")} />

        {/* the layer diagram — where the product sits, and its two halves */}
        <Reveal className="mt-12 sm:mt-16">
          <div ref={rootRef}>
            <Machine sel={sel} onSel={pick} reduce={reduce} t={t} />
          </div>
        </Reveal>

        {/* what the picked half does, in full */}
        <Reveal className="mt-8 sm:mt-10">
          <div className="overflow-hidden rounded-[22px] border border-line bg-white">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={sel}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="grid grid-cols-1 items-center gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10"
              >
                <div>
                  <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-iris">
                    {branch.tag}
                  </div>
                  <h3 className="mt-3.5 text-balance text-[22px] font-semibold leading-[1.28] tracking-[-0.02em] sm:text-[26px]">
                    {block.title}
                  </h3>
                  <p className="mt-3.5 text-[15px] leading-[1.75] text-body">
                    {block.body}
                  </p>
                  <ul className="mt-6 flex flex-col gap-3 border-t border-hair pt-6">
                    {block.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-3 text-[14.5px] leading-[1.7] text-ink"
                      >
                        <span
                          aria-hidden
                          className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-iris"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>{sel === "vision" ? <ReadFigure t={t} /> : <ComposeFigure t={t} />}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

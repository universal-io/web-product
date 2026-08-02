"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";

// Fictional product demo, told like a story reel.
//
// Four scenes play in sequence, each one a thought the user has in front of a
// screen they don't understand, answered without leaving that screen:
//   read  — a notice on a web app gets explained
//   guide — a button that is hard to find gets pointed at
//   grasp — a roundabout chat message gets broken down
//   reply — a draft reply is waiting, and lands in the message box
// A fifth slide hands the move to the reader: press right Shift twice on this
// very page and a scripted panel reads the page itself (SiteDemo, below).
//
// Every scene runs the same beats, so the reel reads as one repeated move
// rather than four different tricks:
//
//   enter → think → linger → dim → hotkey → work → answer → (point/insert) → hold → exit
//
// Three devices keep that causal chain legible even at this pace:
//   - a segmented progress header (the reader always knows where they are)
//   - a step rail under the thought (困る → 右Shift×2 → 答え, lit in order)
//   - the answer echoed large in the left column, so the payoff is never
//     smaller than the problem
//
// Nothing here is interactive except the fifth slide's hotkey listener. Every
// surface is drawn from scratch with the site's own tokens; no screenshots.

type Scene = "read" | "guide" | "grasp" | "reply" | "turn";

type Phase =
  | "enter"
  | "think"
  | "linger"
  | "dim"
  | "hotkey"
  | "work"
  | "answer"
  | "point"
  | "insert"
  | "hold"
  | "wait"
  | "exit";

type Step = `${Scene}.${Phase}`;

const sceneOf = (step: Step) => step.split(".")[0] as Scene;
const phaseOf = (step: Step) => step.split(".")[1] as Phase;

const TYPE_SPEED = 22;
/** Time a typing step needs: the characters themselves, plus a beat to read it. */
const typeMs = (text: string, pad = 350) => text.length * TYPE_SPEED + pad;

/** Per-character stagger and fade for the spoken line. */
const CHAR_STAGGER = 34;
const CHAR_FADE = 380;
const sayMs = (text: string, pad = 420) =>
  text.length * CHAR_STAGGER + CHAR_FADE + pad;

type Row = { k: string; v: string };
type Beat = { step: Step; ms: number };

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** How every window in the reel arrives and leaves. Taken from /vision. */
const windowMotion = {
  initial: { opacity: 0, scale: 0.94, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -12 },
  transition: { duration: 0.4, ease: EASE },
};

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.26, ease: EASE },
};

/* ------------------------------------------------------------------ */
/* primitives                                                          */
/* ------------------------------------------------------------------ */

/**
 * Types `text` out while `phase` is "typing". Only the interval writes state,
 * and the count is stamped with the beat it belongs to (`runId`), so a count
 * left over from an earlier beat can never render as already-typed text.
 */
function useTyped(text: string, phase: "off" | "typing" | "done", runId: number) {
  const [tick, setTick] = useState({ beat: -1, n: 0 });

  useEffect(() => {
    if (phase !== "typing") return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTick({ beat: runId, n: i });
      if (i >= text.length) clearInterval(id);
    }, TYPE_SPEED);
    return () => clearInterval(id);
  }, [text, phase, runId]);

  if (phase === "off") return "";
  if (phase === "done") return text;
  return text.slice(0, tick.beat === runId ? tick.n : 0);
}

function Caret({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span
      className={`io-caret ml-[2px] inline-block h-[1em] w-[2px] translate-y-[2px] align-baseline ${
        tone === "light" ? "bg-white" : "bg-ink"
      }`}
    />
  );
}

/**
 * The spoken line. Every character is in the DOM from the first frame and only
 * its opacity changes, so the block occupies its final two lines immediately —
 * a line that grows into its second line makes the whole column jump.
 */
function SpokenLine({
  text,
  reveal,
  reduce,
}: {
  text: string;
  /** "hidden" before it is spoken, "reveal" while it lands, "shown" after. */
  reveal: "hidden" | "reveal" | "shown";
  reduce: boolean | null;
}) {
  const chars = useMemo(() => Array.from(text), [text]);

  return (
    <p
      // Line breaks come from the message, so the thought breaks where it was
      // written to break rather than wherever the column happens to end.
      className="whitespace-pre-line text-[27px] font-semibold leading-[1.22] tracking-[-0.035em] text-white sm:text-[34px] lg:text-[40px] lg:leading-[1.16]"
    >
      {chars.map((char, i) => (
        <motion.span
          key={`${i}-${char}`}
          animate={{ opacity: reveal === "hidden" ? 0 : 1 }}
          initial={false}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  duration: CHAR_FADE / 1000,
                  delay: reveal === "reveal" ? (i * CHAR_STAGGER) / 1000 : 0,
                  ease: "easeOut",
                }
          }
        >
          {char}
        </motion.span>
      ))}
    </p>
  );
}

function Dot({ pulse = false }: { pulse?: boolean }) {
  return (
    <span
      className={`size-1.5 shrink-0 rounded-full bg-iris ${pulse ? "io-pulse-soft" : ""}`}
    />
  );
}

function MicroLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* progress header + step rail                                         */
/* ------------------------------------------------------------------ */

/** The moving fill inside a chip or bar. Runs once per scene entry (`run`). */
function Fill({
  ms,
  run,
  reduce,
  className = "bg-white/15",
}: {
  ms: number;
  run: number;
  reduce: boolean | null;
  className?: string;
}) {
  if (reduce) {
    return <span className={`absolute inset-0 ${className}`} />;
  }
  return (
    <motion.span
      key={run}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: ms / 1000, ease: "linear" }}
      className={`absolute inset-0 origin-left ${className}`}
    />
  );
}

/**
 * Stories-style indicator: one segment per slide, the active one filling in
 * real time. It sits under the reel on the page's own white, so the reel keeps
 * its edges as footage and the controls read as controls. Desktop gets
 * labels; mobile gets thin bars with the same tap targets.
 */
function ProgressIndicator({
  labels,
  active,
  totals,
  run,
  reduce,
  onPick,
}: {
  labels: string[];
  active: number;
  totals: number[];
  run: number;
  reduce: boolean | null;
  onPick: (i: number) => void;
}) {
  const last = labels.length - 1;

  return (
    <>
      {/* mobile: thin segments, like stories */}
      <div className="flex gap-1.5 sm:hidden">
        {labels.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            aria-pressed={i === active}
            onClick={() => onPick(i)}
            className="flex-1 cursor-pointer py-2"
          >
            <span
              className={`relative block h-[3px] overflow-hidden rounded-full ${
                i < active ? "bg-edge" : "bg-hair"
              }`}
            >
              {i === active && (
                <Fill ms={totals[i]} run={run} reduce={reduce} className="bg-ink" />
              )}
            </span>
          </button>
        ))}
      </div>

      {/* desktop: labelled chips with the same fill */}
      <div className="hidden flex-wrap justify-center gap-2 sm:flex">
        {labels.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-pressed={i === active}
            onClick={() => onPick(i)}
            className={`relative cursor-pointer overflow-hidden rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors duration-200 ${
              i === active
                ? "border-ink text-ink"
                : i < active
                  ? "border-line bg-white text-body hover:border-ink"
                  : "border-line bg-paper text-slate hover:border-ink hover:text-ink"
            }`}
          >
            {i === active && (
              <Fill ms={totals[i]} run={run} reduce={reduce} className="bg-ink/[0.07]" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {i === last && <Dot pulse={i === active} />}
              {label}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

/**
 * The causal chain, spelled out: stuck → hotkey → answered. Lights in order
 * under the thought, every scene, so the order survives the faster pacing.
 */
function StepRail({ active, t }: { active: number; t: ReturnType<typeof useTranslations> }) {
  const steps = t.raw("steps") as string[];

  return (
    <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
      {steps.map((label, i) => {
        const now = active === i;
        const done = active > i;
        return (
          <li key={label} className="flex items-center gap-2.5">
            {i > 0 && (
              <span aria-hidden className="text-[11px] text-white/25">
                →
              </span>
            )}
            <span
              className={`flex items-center gap-1.5 transition-colors duration-300 ${
                now ? "text-white" : done ? "text-white/65" : "text-white/30"
              }`}
            >
              <span
                className={`size-1.5 rounded-full transition-colors duration-300 ${
                  now ? "io-pulse-soft bg-iris" : done ? "bg-iris/70" : "bg-white/20"
                }`}
              />
              <span className="font-mono text-[10px] tracking-[0.06em] sm:text-[11px]">
                {label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* fake surfaces                                                       */
/* ------------------------------------------------------------------ */

function WindowChrome({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-line bg-paper px-4 py-2.5">
      <span className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-edge" />
        <span className="size-2.5 rounded-full bg-edge" />
        <span className="size-2.5 rounded-full bg-edge" />
      </span>
      <span className="truncate rounded-md border border-line bg-white px-2.5 py-1 font-mono text-[10px] text-slate">
        {label}
      </span>
    </div>
  );
}

function SkeletonLines({ widths }: { widths: string[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {widths.map((w, i) => (
        <span key={i} className="h-2 rounded-full bg-hair" style={{ width: w }} />
      ))}
    </div>
  );
}

/** Scene 1: a document with a notice on it the user cannot parse. */
function ReadStage({
  step,
  t,
}: {
  step: Step;
  t: ReturnType<typeof useTranslations>;
}) {
  const phase = phaseOf(step);

  // The notice lights as soon as the thought starts, and everything else drops
  // back. From the hotkey onward the whole screen goes behind the scrim.
  const spotlight =
    phase === "enter" ? "none" : phase === "think" || phase === "linger" ? "notice" : "all";

  const dimRest =
    spotlight === "none" ? "opacity-100" : spotlight === "notice" ? "opacity-30" : "opacity-40";
  const dimNotice = spotlight === "all" ? "opacity-40" : "opacity-100";
  const lit = spotlight === "notice";

  return (
    <>
      <div className={`transition-opacity duration-500 ${dimRest}`}>
        <WindowChrome label={t("scenes.read.url")} />
      </div>
      <div className="flex h-full">
        <div
          className={`hidden w-[124px] shrink-0 flex-col gap-1 border-r border-line bg-paper/60 p-3 transition-opacity duration-500 sm:flex ${dimRest}`}
        >
          {["Drafts", "Shared", "Archive"].map((item, i) => (
            <span
              key={item}
              className={`rounded-md px-2 py-1.5 text-[11px] font-medium ${
                i === 0 ? "bg-white text-ink shadow-[0_1px_2px_rgba(16,17,20,0.05)]" : "text-slate"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <div className={`transition-opacity duration-500 ${dimRest}`}>
            <div className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">
              {t("scenes.read.docTitle")}
            </div>
            <div className="mt-1 font-mono text-[10px] text-faint">Edited just now</div>
          </div>

          <div className="mt-4">
            <div
              className={`relative rounded-lg border bg-coral/[0.06] px-3 py-2.5 transition-opacity duration-500 ${dimNotice} ${
                lit ? "border-coral/60" : "border-coral/30"
              }`}
            >
              {/* the ring is what makes "this bit, not the rest" readable */}
              <span
                className={`pointer-events-none absolute -inset-1 rounded-[10px] ring-2 ring-coral transition-opacity duration-500 ${
                  lit ? "io-ring opacity-100" : "opacity-0"
                }`}
              />
              <div className="flex gap-2">
                <span className="mt-[5px] size-1.5 shrink-0 rounded-full bg-coral" />
                <p className="text-[11px] leading-[1.55] text-body">
                  {t("scenes.read.notice")}
                </p>
              </div>
            </div>
            <div className={`mt-4 pr-2 transition-opacity duration-500 ${dimRest}`}>
              <SkeletonLines widths={["92%", "78%", "85%", "54%"]} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** The five unlabelled toolbar glyphs of scene 2. The fourth is the answer. */
const TOOLBAR_GLYPHS = [
  // search
  "M7.2 3.4a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm3 7.1 2.6 2.6",
  // filter
  "M2.6 4h9.8M4.4 7.4h6.2M6.2 10.8h2.6",
  // refresh
  "M12 7.5a4.5 4.5 0 1 1-1.6-3.4m1.8-1.3v3.2H9",
  // export — a tray with an arrow going down into it
  "M7.5 2.6v6.2m0 0L5.2 6.5m2.3 2.3 2.3-2.3M2.9 10.4v1.4a.8.8 0 0 0 .8.8h7.6a.8.8 0 0 0 .8-.8v-1.4",
  // more
  "M4 7.5h.01M7.5 7.5h.01M11 7.5h.01",
] as const;

const EXPORT_GLYPH = 3;

/** Scene 2: a screen where the button you were told to press is not obvious. */
function GuideStage({
  step,
  t,
}: {
  step: Step;
  t: ReturnType<typeof useTranslations>;
}) {
  const phase = phaseOf(step);
  const pointing = phase === "point" || phase === "hold";
  const dim = phase === "enter" || phase === "think" || phase === "linger";

  return (
    <>
      <div className={`transition-opacity duration-500 ${dim ? "opacity-100" : "opacity-40"}`}>
        <WindowChrome label={t("scenes.guide.url")} />
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div
          className={`flex items-start justify-between gap-3 transition-opacity duration-500 ${
            dim ? "opacity-100" : "opacity-40"
          }`}
        >
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">
              {t("scenes.guide.docTitle")}
            </div>
            <div className="mt-1 font-mono text-[10px] text-faint">
              {t("scenes.guide.docMeta")}
            </div>
          </div>
        </div>

        {/* The toolbar sits outside the dimming wrapper: the target has to be
            able to come back up through the scrim on its own. */}
        <div className="mt-3 flex items-center justify-end gap-1.5">
          {TOOLBAR_GLYPHS.map((d, i) => {
            const target = i === EXPORT_GLYPH;
            const highlighted = target && pointing;
            return (
              <span
                key={d}
                className={`relative inline-flex size-7 items-center justify-center rounded-lg border transition-all duration-500 ${
                  highlighted
                    ? "z-30 border-iris bg-white text-iris shadow-[0_4px_16px_rgba(91,92,255,0.45)]"
                    : "border-line bg-white text-slate"
                } ${!dim && !highlighted ? "opacity-40" : "opacity-100"}`}
              >
                {highlighted && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="io-ring pointer-events-none absolute -inset-1.5 rounded-[11px] ring-2 ring-iris"
                  />
                )}
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <path
                    d={d}
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            );
          })}
        </div>

        <div
          className={`mt-3 transition-opacity duration-500 ${dim ? "opacity-100" : "opacity-40"}`}
        >
          <div className="rounded-lg border border-line bg-paper px-3 py-2.5">
            <p className="text-[11px] leading-[1.55] text-body">
              {t("scenes.guide.instruction")}
            </p>
          </div>
          <div className="mt-4 pr-2">
            <SkeletonLines widths={["88%", "64%", "80%", "46%"]} />
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Scenes 3–4: a chat thread with a message that takes effort to decode. Each
 * scene brings its own thread — scene 3 is a language the reader cannot read at
 * all, scene 4 is one they can read but still have to answer.
 */
function ChatStage({
  step,
  beat,
  t,
}: {
  step: Step;
  beat: number;
  t: ReturnType<typeof useTranslations>;
}) {
  const scene = sceneOf(step);
  const phase = phaseOf(step);
  const inserted = phase === "insert" || phase === "hold";
  const dim = phase === "enter" || phase === "think" || phase === "linger";
  const draft = t("scenes.reply.draft");
  const typedDraft = useTyped(draft, inserted ? "done" : "off", beat);

  const k = (key: string) => t(`scenes.${scene}.${key}`);
  const composer = scene === "reply";

  return (
    <>
      <div className={`transition-opacity duration-500 ${dim ? "opacity-100" : "opacity-40"}`}>
        <WindowChrome label={`${k("app")} — ${k("channel")}`} />
      </div>
      <div
        className={`flex h-full flex-col p-4 transition-opacity duration-500 sm:p-5 ${
          dim ? "opacity-100" : "opacity-40"
        }`}
      >
        <div className="flex gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-carbon text-[12px] font-semibold text-white">
            {Array.from(k("sender"))[0]}
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[12px] font-semibold text-ink">{k("sender")}</span>
              <span className="font-mono text-[10px] text-faint">{k("time")}</span>
            </div>
            <p className="mt-1.5 text-[12px] leading-[1.7] text-body">{k("message")}</p>
          </div>
        </div>

        {composer && (
          <div className="mt-auto pt-4">
            <div
              className={`rounded-xl border bg-white px-3 py-2.5 transition-colors ${
                inserted ? "border-iris" : "border-edge"
              }`}
            >
              {inserted ? (
                <p className="text-[12px] leading-[1.6] text-ink">
                  {typedDraft}
                  <Caret />
                </p>
              ) : (
                <span className="text-[12px] text-ghost">
                  {t("scenes.reply.placeholder")}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/** Slide 5: no fake window — the reader's own screen is the stage now. */
function TurnStage({
  t,
  pressTick,
  onTry,
}: {
  t: ReturnType<typeof useTranslations>;
  pressTick: number;
  onTry: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-7 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] p-6">
      <span className="rounded-md border border-white/15 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] text-white/60">
        {t("turn.frameUrl")} — {t("turn.frameCaption")}
      </span>

      <button
        type="button"
        onClick={onTry}
        aria-label={t("turn.tap")}
        className="flex cursor-pointer items-center gap-3"
      >
        {/* Nudges on every real right-Shift press, so the page visibly hears you. */}
        <motion.span
          key={pressTick}
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="io-pulse-soft inline-flex h-12 items-center justify-center rounded-xl bg-white px-5 text-[14px] font-semibold text-ink shadow-[0_6px_22px_rgba(0,0,0,0.4)]"
        >
          {t("hotkey")}
        </motion.span>
        <span className="font-mono text-[16px] font-semibold text-white">
          {t("hotkeyTimes")}
        </span>
      </button>

      <button
        type="button"
        onClick={onTry}
        className="cursor-pointer rounded-full border border-white/25 px-4 py-2 text-[12.5px] font-medium text-white/75 transition-colors hover:border-white/60 hover:text-white"
      >
        {t("turn.tap")}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the panel                                                           */
/* ------------------------------------------------------------------ */

function Panel({
  step,
  beat,
  t,
}: {
  step: Step;
  beat: number;
  t: ReturnType<typeof useTranslations>;
}) {
  const scene = sceneOf(step);
  const phase = phaseOf(step);

  const readAnswer = t("scenes.read.answer");
  const guideAnswer = t("scenes.guide.answer");
  const draft = t("scenes.reply.draft");
  const rows = t.raw("scenes.grasp.rows") as Row[];

  // A typed line stays on screen for the rest of its scene, so later beats in
  // the same scene read "done" rather than retyping.
  const typedRead = useTyped(
    readAnswer,
    scene !== "read" ? "off" : phase === "answer" ? "typing" : phase === "hold" ? "done" : "off",
    beat,
  );
  const typedGuide = useTyped(
    guideAnswer,
    scene !== "guide" ? "off" : phase === "answer" ? "typing" : "done",
    beat,
  );
  const typedDraft = useTyped(
    draft,
    scene !== "reply" ? "off" : phase === "answer" ? "typing" : "done",
    beat,
  );

  const busy = phase === "work";
  const busyLabel = scene === "reply" ? t("drafting") : t("reading");

  return (
    <div className="rounded-2xl border border-line bg-white/95 p-4 shadow-[0_12px_40px_rgba(16,17,20,0.14)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <Dot pulse={busy} />
          <MicroLabel>{t("app")}</MicroLabel>
        </span>
        <span className="font-mono text-[10px] text-faint">
          {t("hotkey")} {t("hotkeyTimes")}
        </span>
      </div>

      <div className="mt-3.5 min-h-[132px]">
        <AnimatePresence mode="wait">
          {busy ? (
            <motion.div
              key="busy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <span className="io-pulse-soft size-1.5 rounded-full bg-iris" />
              <MicroLabel>{busyLabel}</MicroLabel>
            </motion.div>
          ) : scene === "read" ? (
            <motion.div key="read" {...fade}>
              <p className="text-[12.5px] leading-[1.7] text-ink">
                {typedRead}
                {phase === "answer" && <Caret />}
              </p>
              {phase === "hold" && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 border-t border-hair pt-3 text-[12px] leading-[1.6] text-iris"
                >
                  {t("scenes.read.hint")}
                </motion.p>
              )}
            </motion.div>
          ) : scene === "guide" ? (
            <motion.div key="guide" {...fade}>
              <MicroLabel>{t("guiding")}</MicroLabel>
              <p className="mt-1.5 text-[12.5px] leading-[1.7] text-ink">
                {typedGuide}
                {phase === "answer" && <Caret />}
              </p>
              {(phase === "point" || phase === "hold") && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 border-t border-hair pt-3 text-[12px] leading-[1.6] text-iris"
                >
                  <Dot pulse />
                  {t("scenes.guide.pointHint")}
                </motion.p>
              )}
            </motion.div>
          ) : scene === "grasp" ? (
            <motion.div key="grasp" {...fade} className="flex flex-col gap-2">
              {rows.map((row, i) => (
                <motion.div
                  key={row.k}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.16 }}
                  className="rounded-lg bg-paper px-2.5 py-2"
                >
                  <MicroLabel>{row.k}</MicroLabel>
                  <p className="mt-1 text-[12px] leading-[1.55] text-ink">{row.v}</p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="reply" {...fade}>
              <MicroLabel>{t("scenes.reply.draftLabel")}</MicroLabel>
              <p className="mt-2 text-[12.5px] leading-[1.7] text-ink">
                {typedDraft}
                {phase === "answer" && <Caret />}
              </p>
              {(phase === "insert" || phase === "hold") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-2 border-t border-hair pt-3"
                >
                  <kbd className="rounded border border-edge bg-paper px-1.5 py-0.5 font-mono text-[10px] text-slate">
                    ⏎
                  </kbd>
                  <MicroLabel>{t("insertHint")}</MicroLabel>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the site demo — the one interactive piece                           */
/* ------------------------------------------------------------------ */

/**
 * The scripted panel that answers about this very page. Opened by pressing
 * right Shift twice anywhere on the page (or the buttons on slide 5), closed
 * with Esc — both on purpose the same gestures as the real product.
 */
function SiteDemo({
  state,
  run,
  reduce,
  onClose,
  t,
}: {
  state: "reading" | "answer";
  run: number;
  reduce: boolean | null;
  onClose: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const answer = t("turn.panelAnswer");
  const typed = useTyped(
    answer,
    state === "answer" ? (reduce ? "done" : "typing") : "off",
    run,
  );

  return (
    <motion.div
      role="dialog"
      aria-label={t("app")}
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="fixed bottom-5 right-5 z-[80] w-[min(92vw,370px)] rounded-2xl border border-line bg-white/95 p-4 shadow-[0_18px_60px_rgba(16,17,20,0.28)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <Dot pulse={state === "reading"} />
          <MicroLabel>{t("app")}</MicroLabel>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("turn.close")}
          className="cursor-pointer rounded-md px-1.5 py-0.5 font-mono text-[12px] text-slate transition-colors hover:bg-paper hover:text-ink"
        >
          ×
        </button>
      </div>

      <div className="mt-3.5 min-h-[96px]">
        {state === "reading" ? (
          <span className="flex items-center gap-2">
            <span className="io-pulse-soft size-1.5 rounded-full bg-iris" />
            <MicroLabel>{t("turn.panelReading")}</MicroLabel>
          </span>
        ) : (
          <p className="text-[12.5px] leading-[1.7] text-ink">
            {typed}
            {typed.length < answer.length && <Caret />}
          </p>
        )}
      </div>

      <div className="mt-3 border-t border-hair pt-3">
        <span className="font-mono text-[10px] text-faint">{t("turn.escHint")}</span>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* the reel                                                            */
/* ------------------------------------------------------------------ */

export default function StoryReel({
  framed = false,
  showTabs = false,
}: {
  /** Wrap the reel in the site's dark card, as used on the home page. */
  framed?: boolean;
  /** Show the segmented progress header. Picking a slide keeps it on repeat. */
  showTabs?: boolean;
}) {
  const t = useTranslations("story");
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });
  const tabs = t.raw("tabs") as string[];

  const scenes = useMemo<{ id: Scene; beats: Beat[] }[]>(() => {
    const say = (scene: Scene) => sayMs(t(`scenes.${scene}.monologue`));

    // Shared spine: the screen goes back, then the keys land on top of it.
    const press = (scene: Scene): Beat[] => [
      { step: `${scene}.dim`, ms: 400 },
      { step: `${scene}.hotkey`, ms: 1250 },
    ];

    return [
      {
        id: "read",
        beats: [
          { step: "read.enter", ms: 800 },
          { step: "read.think", ms: say("read") },
          { step: "read.linger", ms: 450 },
          ...press("read"),
          { step: "read.work", ms: 650 },
          { step: "read.answer", ms: typeMs(t("scenes.read.answer")) },
          { step: "read.hold", ms: 2100 },
          { step: "read.exit", ms: 500 },
        ],
      },
      {
        id: "guide",
        beats: [
          { step: "guide.enter", ms: 850 },
          { step: "guide.think", ms: say("guide") },
          { step: "guide.linger", ms: 450 },
          ...press("guide"),
          { step: "guide.work", ms: 650 },
          { step: "guide.answer", ms: typeMs(t("scenes.guide.answer")) },
          { step: "guide.point", ms: 1700 },
          { step: "guide.hold", ms: 1500 },
          { step: "guide.exit", ms: 500 },
        ],
      },
      {
        id: "grasp",
        beats: [
          { step: "grasp.enter", ms: 850 },
          { step: "grasp.think", ms: say("grasp") },
          { step: "grasp.linger", ms: 500 },
          ...press("grasp"),
          { step: "grasp.work", ms: 700 },
          { step: "grasp.answer", ms: 1350 },
          { step: "grasp.hold", ms: 2400 },
          { step: "grasp.exit", ms: 500 },
        ],
      },
      {
        id: "reply",
        beats: [
          { step: "reply.enter", ms: 850 },
          { step: "reply.think", ms: say("reply") },
          { step: "reply.linger", ms: 450 },
          ...press("reply"),
          { step: "reply.work", ms: 650 },
          { step: "reply.answer", ms: typeMs(t("scenes.reply.draft")) },
          { step: "reply.insert", ms: 1400 },
          { step: "reply.hold", ms: 1800 },
          { step: "reply.exit", ms: 500 },
        ],
      },
      {
        id: "turn",
        beats: [
          { step: "turn.wait", ms: 6800 },
          { step: "turn.exit", ms: 500 },
        ],
      },
    ];
  }, [t]);

  const totals = useMemo(
    () => scenes.map((s) => s.beats.reduce((sum, b) => sum + b.ms, 0)),
    [scenes],
  );

  const [pos, setPos] = useState({ scene: 0, beat: 0, run: 0 });
  // Once a slide is chosen it repeats instead of handing over to the next one.
  const [picked, setPicked] = useState(false);

  /* --- the interactive site demo ---------------------------------- */

  const [demo, setDemo] = useState<"closed" | "reading" | "answer">("closed");
  // Counts demo openings, so a rerun retypes instead of showing stale text.
  const [demoSeq, setDemoSeq] = useState(0);
  // Bumped on every real right-Shift press so slide 5's keycap can react.
  const [pressTick, setPressTick] = useState(0);
  const lastShift = useRef(0);

  const openDemo = () => {
    setDemoSeq((n) => n + 1);
    setDemo("reading");
  };

  useEffect(() => {
    if (demo !== "reading") return;
    const id = setTimeout(() => setDemo("answer"), reduce ? 0 : 850);
    return () => clearTimeout(id);
  }, [demo, reduce]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDemo("closed");
        return;
      }
      if (e.code !== "ShiftRight" || e.repeat) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable))
        return;
      setPressTick((n) => n + 1);
      const now = performance.now();
      if (now - lastShift.current < 650) {
        lastShift.current = 0;
        openDemo();
      } else {
        lastShift.current = now;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* --- the phase clock --------------------------------------------- */

  useEffect(() => {
    // The reel holds still while the reader is using the demo panel.
    if (reduce || !inView || demo !== "closed") return;
    const beats = scenes[pos.scene].beats;
    const id = setTimeout(() => {
      setPos((prev) => {
        const last = prev.beat >= scenes[prev.scene].beats.length - 1;
        if (!last) return { ...prev, beat: prev.beat + 1 };
        return {
          scene: picked ? prev.scene : (prev.scene + 1) % scenes.length,
          beat: 0,
          run: prev.run + 1,
        };
      });
    }, beats[pos.beat].ms);
    return () => clearTimeout(id);
  }, [pos, picked, inView, reduce, demo, scenes]);

  // Coming back into view restarts the current slide from its first beat, so
  // the reader never lands in the middle of a sentence.
  const wasIn = useRef(false);
  useEffect(() => {
    if (inView && !wasIn.current) {
      setPos((p) => ({ ...p, beat: 0, run: p.run + 1 }));
    }
    wasIn.current = inView;
  }, [inView]);

  const pick = (i: number) => {
    setPicked(true);
    setPos((p) => ({ scene: i, beat: 0, run: p.run + 1 }));
  };

  /* --- derived frame ------------------------------------------------ */

  // With reduced motion the loop never runs: show the scene at rest, answered,
  // which is the "hold" beat rather than the empty frame after it.
  const beats = scenes[pos.scene].beats;
  const restIdx = Math.max(
    beats.findIndex((b) => phaseOf(b.step) === "hold"),
    0,
  );
  const step: Step = reduce ? beats[restIdx].step : beats[pos.beat].step;
  const scene = sceneOf(step);
  const phase = phaseOf(step);
  const turn = scene === "turn";

  // The window is on screen for the whole scene except the frame that clears it.
  const windowOn = phase !== "exit";
  // From the hotkey onward the screen sits behind a scrim for the rest of the
  // scene, so the only lit thing left is the panel.
  const scrimOn =
    !turn &&
    phase !== "enter" &&
    phase !== "think" &&
    phase !== "linger" &&
    phase !== "exit";
  const panelOpen =
    phase === "work" ||
    phase === "answer" ||
    phase === "point" ||
    phase === "insert" ||
    phase === "hold";
  // Beats are numbered across runs so a typing pass is never mistaken for the
  // same pass one loop earlier.
  const beatId = pos.run * 100 + pos.beat;

  // Where the causal chain currently is: stuck → hotkey → answered.
  const railStep = turn
    ? 1
    : phase === "enter" || phase === "think" || phase === "linger"
      ? 0
      : phase === "dim" || phase === "hotkey"
        ? 1
        : phase === "hold" || phase === "exit"
          ? 3
          : 2;

  const monologue = turn ? "" : t(`scenes.${scene}.monologue`);
  const monologueReveal: "hidden" | "reveal" | "shown" = reduce
    ? "shown"
    : phase === "enter"
      ? "hidden"
      : phase === "think"
        ? "reveal"
        : "shown";

  // Once the panel has answered, the answer's core line lands large in the
  // left column — the payoff gets at least the size the problem had.
  const echoOn =
    !turn && (phase === "point" || phase === "insert" || phase === "hold");
  const echo = turn ? "" : t(`scenes.${scene}.echo`);

  const labels = [...tabs, t("turn.tab")];

  const reel = (
    <div
      ref={rootRef}
      className="grid grid-cols-1 items-center gap-9 text-left lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-12"
    >
      {/* left: the thought, then the answer, then how it happened */}
      <div>
        <motion.div
          animate={{ opacity: phase === "exit" ? 0 : 1 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="flex min-h-[168px] flex-col justify-start sm:min-h-[200px] lg:min-h-[248px]"
        >
          {turn ? (
            <motion.div key="turn-copy" {...fade}>
              <p className="whitespace-pre-line text-[27px] font-semibold leading-[1.22] tracking-[-0.035em] text-white sm:text-[34px] lg:text-[40px] lg:leading-[1.16]">
                {t("turn.title")}
              </p>
              <p className="mt-4 max-w-[380px] text-[14.5px] leading-[1.7] text-white/65">
                {t("turn.sub")}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Keyed by scene so each new thought starts from its own hidden
                  state rather than cross-fading with the previous one. */}
              <motion.div
                animate={{ opacity: echoOn ? 0.4 : 1 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <SpokenLine
                  key={scene}
                  text={monologue}
                  reveal={monologueReveal}
                  reduce={reduce}
                />
              </motion.div>

              <AnimatePresence>
                {echoOn && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="mt-5 flex gap-3.5"
                  >
                    <span className="w-[3px] shrink-0 self-stretch rounded-full bg-iris" />
                    <p className="text-[18px] font-semibold leading-[1.4] tracking-[-0.02em] text-white sm:text-[21px] lg:text-[23px]">
                      {echo}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>

        <div className="mt-6 border-t border-white/10 pt-5 lg:mt-8">
          <StepRail active={railStep} t={t} />
        </div>
      </div>

      {/* right: the screen, and the panel over it */}
      <div className="relative" aria-hidden={turn ? undefined : true}>
        <div className="relative h-[340px] sm:h-[400px]">
          <AnimatePresence mode="wait">
            {windowOn && (
              <motion.div
                key={scene}
                initial={reduce ? false : windowMotion.initial}
                animate={windowMotion.animate}
                exit={windowMotion.exit}
                transition={windowMotion.transition}
                className={
                  turn
                    ? "absolute inset-0"
                    : "absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_20px_rgba(16,17,20,0.07)]"
                }
              >
                {turn ? (
                  <TurnStage t={t} pressTick={pressTick} onTry={openDemo} />
                ) : scene === "read" ? (
                  <ReadStage step={step} t={t} />
                ) : scene === "guide" ? (
                  <GuideStage step={step} t={t} />
                ) : (
                  <ChatStage step={step} beat={beatId} t={t} />
                )}

                {/* The hotkey lands on top of the screen, not beside it: the
                    point is that you press it without leaving what you were
                    looking at. The scrim then stays for the rest of the scene. */}
                <AnimatePresence>
                  {scrimOn && (
                    <motion.div
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="absolute inset-0 z-20 flex items-center justify-center bg-ink/50"
                    >
                      <AnimatePresence>
                        {phase === "hotkey" && (
                          <motion.div
                            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            // Held back just enough that the screen is seen
                            // going dark first, so the keys read as a move.
                            transition={{ duration: 0.25, delay: 0.15, ease: EASE }}
                            className="flex items-center gap-3"
                          >
                            {/* Two quick presses, the way the key is hit. */}
                            <motion.span
                              animate={reduce ? { y: 0 } : { y: [0, 0, 5, 0, 5, 0] }}
                              transition={{
                                duration: 0.85,
                                delay: 0.4,
                                ease: "easeOut",
                                times: [0, 0.15, 0.33, 0.52, 0.74, 0.92],
                              }}
                              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-5 text-[14px] font-semibold text-ink shadow-[0_6px_22px_rgba(0,0,0,0.4)]"
                            >
                              {t("hotkey")}
                            </motion.span>
                            <span className="font-mono text-[16px] font-semibold text-white">
                              {t("hotkeyTimes")}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* z-30 keeps the panel above the scrim covering the screen behind it. */}
        <div className="relative z-30 mt-4 sm:absolute sm:bottom-5 sm:right-5 sm:mt-0 sm:w-[286px]">
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <Panel step={step} beat={beatId} t={t} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  const indicator = showTabs ? (
    <ProgressIndicator
      labels={labels}
      active={pos.scene}
      totals={totals}
      run={pos.run}
      reduce={reduce}
      onPick={pick}
    />
  ) : null;

  // `demo` only leaves "closed" through client-side events, so createPortal is
  // never reached during server rendering. Closing is intentionally instant —
  // the same abruptness Esc has in the real product.
  const overlay =
    demo !== "closed"
      ? createPortal(
          <SiteDemo
            state={demo}
            run={demoSeq}
            reduce={reduce}
            onClose={() => setDemo("closed")}
            t={t}
          />,
          document.body,
        )
      : null;

  if (!framed) {
    return (
      <>
        {reel}
        {indicator && <div className="mt-7 sm:mt-8">{indicator}</div>}
        {overlay}
      </>
    );
  }

  return (
    <div
      className="io-fade-up mt-12 w-full max-w-[1120px] sm:mt-[72px]"
      style={{ animationDelay: "0.4s", animationDuration: "0.7s" }}
    >
      {/* Dark on a white page: the reel reads as footage rather than as one
          more block of the layout, which is what keeps the beats from
          blurring together. */}
      <div className="rounded-3xl border border-white/10 bg-ink p-4 pb-6 sm:p-8 lg:p-11 lg:pb-10">
        {reel}
      </div>
      {/* The indicator belongs to the page, not to the footage — it sits
          under the frame the way a caption or a control strip would. */}
      {indicator && <div className="mt-6 sm:mt-7">{indicator}</div>}
      {overlay}
    </div>
  );
}

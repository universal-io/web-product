"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";

// Fictional, looping product demo.
//
// Four scenes play in sequence, each one a thought the user has in front of a
// screen they don't understand, answered without leaving that screen:
//   read  — an English notice on a web app gets explained
//   guide — a follow-up question turns into step-by-step guidance
//   grasp — a roundabout chat message gets broken down
//   reply — a draft reply is waiting, and lands in the message box
//
// Nothing here is interactive. Every surface is drawn from scratch with the
// site's own tokens; no screenshots, no real product code.

type Step =
  | "read.idle"
  | "read.hotkey"
  | "read.reading"
  | "read.answer"
  | "read.hold"
  | "guide.ask"
  | "guide.step1"
  | "guide.click1"
  | "guide.reread"
  | "guide.step2"
  | "guide.click2"
  | "guide.done"
  | "grasp.idle"
  | "grasp.hotkey"
  | "grasp.reading"
  | "grasp.answer"
  | "grasp.hold"
  | "reply.idle"
  | "reply.hotkey"
  | "reply.drafting"
  | "reply.draft"
  | "reply.insert"
  | "reply.hold";

type Scene = "read" | "guide" | "grasp" | "reply";

const sceneOf = (step: Step) => step.split(".")[0] as Scene;

const TYPE_SPEED = 22;
/** Time a typing step needs: the characters themselves, plus a beat to read it. */
const typeMs = (text: string, pad = 900) => text.length * TYPE_SPEED + pad;

type Row = { k: string; v: string };
type Beat = { step: Step; ms: number };

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

function Caret() {
  return (
    <span className="io-caret ml-[2px] inline-block h-[1em] w-[2px] translate-y-[2px] bg-ink align-baseline" />
  );
}

function Pointer() {
  // Sits on the corner of whatever is being pressed, so no coordinate math is
  // needed to make a click read as a click.
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: [0.9, 0.78, 0.9] }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="pointer-events-none absolute -bottom-3 -right-2 z-20"
    >
      <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
        <path
          d="M2 1.5v15.2l3.9-3.7 2.4 5.6 2.9-1.3-2.4-5.4h5.3L2 1.5Z"
          fill="#101114"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </motion.span>
  );
}

/** Wraps whatever Copilot is pointing at: a ring while guiding, a cursor on the press. */
function Spot({
  on,
  pressing,
  children,
  className = "",
}: {
  on: boolean;
  pressing: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <span
        className={`absolute -inset-1.5 rounded-[10px] transition-opacity duration-300 ${
          on ? "io-ring opacity-100 ring-2 ring-iris" : "opacity-0"
        }`}
      />
      {children}
      {pressing && <Pointer />}
    </span>
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

/** Scenes 1–2: a generic web app the user is stuck in. */
function AppStage({
  step,
  t,
}: {
  step: Step;
  t: ReturnType<typeof useTranslations>;
}) {
  const signinPane =
    step === "guide.reread" || step === "guide.step2" || step === "guide.click2";
  const signedIn = step === "guide.done";

  return (
    <>
      <WindowChrome label={t("scenes.read.url")} />
      <div className="flex h-full">
        <div className="hidden w-[124px] shrink-0 flex-col gap-1 border-r border-line bg-paper/60 p-3 sm:flex">
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
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">
                {t("scenes.read.docTitle")}
              </div>
              {signedIn ? (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-iris/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-iris"
                >
                  <Dot />
                  {t("scenes.guide.savedBadge")}
                </motion.span>
              ) : (
                <div className="mt-1 font-mono text-[10px] text-faint">Edited just now</div>
              )}
            </div>

            <Spot
              on={step === "guide.step1" || step === "guide.click1"}
              pressing={step === "guide.click1"}
            >
              <span className="rounded-lg bg-ink px-3 py-1.5 text-[11px] font-semibold text-white">
                Sign in
              </span>
            </Spot>
          </div>

          <AnimatePresence mode="wait">
            {signinPane ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="mt-5 rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(16,17,20,0.04)]"
              >
                <div className="text-[13px] font-semibold text-ink">
                  {t("scenes.guide.signinTitle")}
                </div>
                <div className="mt-3.5 flex flex-col gap-2">
                  <Spot
                    on={step === "guide.step2" || step === "guide.click2"}
                    pressing={step === "guide.click2"}
                    className="w-full"
                  >
                    <span className="w-full rounded-lg border border-edge px-3 py-2 text-center text-[11px] font-medium text-ink">
                      {t("scenes.guide.signinGoogle")}
                    </span>
                  </Spot>
                  <span className="rounded-lg border border-line px-3 py-2 text-center text-[11px] font-medium text-slate">
                    {t("scenes.guide.signinEmail")}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="doc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                {!signedIn && (
                  <div className="rounded-lg border border-coral/30 bg-coral/[0.06] px-3 py-2.5">
                    <div className="flex gap-2">
                      <span className="mt-[5px] size-1.5 shrink-0 rounded-full bg-coral" />
                      <p className="text-[11px] leading-[1.55] text-body">
                        {t("scenes.read.notice")}
                      </p>
                    </div>
                  </div>
                )}
                <div className="mt-4 pr-2">
                  <SkeletonLines widths={["92%", "78%", "85%", "54%"]} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

/** Scenes 3–4: a chat thread with a message that takes effort to decode. */
function ChatStage({
  step,
  beat,
  t,
}: {
  step: Step;
  beat: number;
  t: ReturnType<typeof useTranslations>;
}) {
  const inserted = step === "reply.insert" || step === "reply.hold";
  const draft = t("scenes.reply.draft");
  const typedDraft = useTyped(draft, inserted ? "done" : "off", beat);

  return (
    <>
      <WindowChrome label={`${t("scenes.grasp.app")} — ${t("scenes.grasp.channel")}`} />
      <div className="flex h-full flex-col p-4 sm:p-5">
        <div className="flex gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-carbon text-[12px] font-semibold text-white">
            {t("scenes.grasp.sender").slice(0, 1)}
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[12px] font-semibold text-ink">
                {t("scenes.grasp.sender")}
              </span>
              <span className="font-mono text-[10px] text-faint">
                {t("scenes.grasp.time")}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-[1.7] text-body">
              {t("scenes.grasp.message")}
            </p>
          </div>
        </div>

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
      </div>
    </>
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

  const answer = t("scenes.read.answer");
  const ask = t("scenes.guide.ask");
  const draft = t("scenes.reply.draft");
  const rows = t.raw("scenes.grasp.rows") as Row[];

  // A typed line stays on screen for the rest of its scene, so later steps in
  // the same scene read "done" rather than retyping.
  const typedAnswer = useTyped(
    answer,
    step === "read.answer" ? "typing" : step === "read.hold" ? "done" : "off",
    beat,
  );
  const typedAsk = useTyped(
    ask,
    scene !== "guide" ? "off" : step === "guide.ask" ? "typing" : "done",
    beat,
  );
  const typedDraft = useTyped(
    draft,
    step === "reply.draft" ? "typing" : step === "reply.insert" ? "done" : "off",
    beat,
  );

  const busy =
    step === "read.reading" ||
    step === "guide.reread" ||
    step === "reply.drafting" ||
    step === "grasp.reading";

  const busyLabel =
    step === "guide.reread"
      ? t("rereading")
      : step === "reply.drafting"
        ? t("drafting")
        : t("reading");

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
                {typedAnswer}
                {step === "read.answer" && <Caret />}
              </p>
              {step === "read.hold" && (
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
              <div className="rounded-lg border border-edge bg-paper px-2.5 py-2 text-[12px] text-ink">
                {typedAsk}
                {step === "guide.ask" && <Caret />}
              </div>
              {step !== "guide.ask" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3"
                >
                  <MicroLabel>{step === "guide.done" ? "" : t("guiding")}</MicroLabel>
                  <p className="mt-1.5 text-[12.5px] leading-[1.7] text-ink">
                    {step === "guide.done"
                      ? t("scenes.guide.done")
                      : step === "guide.step2" || step === "guide.click2"
                        ? t("scenes.guide.step2")
                        : t("scenes.guide.step1")}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : scene === "grasp" ? (
            <motion.div key="grasp" {...fade} className="flex flex-col gap-2">
              {rows.map((row, i) => (
                <motion.div
                  key={row.k}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.18 }}
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
                {step === "reply.draft" && <Caret />}
              </p>
              {step === "reply.insert" && (
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

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: EASE },
};

/* ------------------------------------------------------------------ */
/* the reel                                                            */
/* ------------------------------------------------------------------ */

export default function StoryReel({
  framed = false,
  showTabs = false,
}: {
  /** Wrap the reel in the site's paper card, as used on the home page. */
  framed?: boolean;
  /** Let the reader pick a scene. Picking one keeps it playing on repeat. */
  showTabs?: boolean;
}) {
  const t = useTranslations("story");
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });
  const tabs = t.raw("tabs") as string[];

  const scenes = useMemo<{ id: Scene; beats: Beat[] }[]>(() => {
    const answer = t("scenes.read.answer");
    const ask = t("scenes.guide.ask");
    const draft = t("scenes.reply.draft");
    return [
      {
        id: "read",
        beats: [
          { step: "read.idle", ms: 1700 },
          { step: "read.hotkey", ms: 900 },
          { step: "read.reading", ms: 1100 },
          { step: "read.answer", ms: typeMs(answer, 300) },
          { step: "read.hold", ms: 2600 },
        ],
      },
      {
        id: "guide",
        beats: [
          { step: "guide.ask", ms: typeMs(ask, 500) },
          { step: "guide.step1", ms: 2000 },
          { step: "guide.click1", ms: 900 },
          { step: "guide.reread", ms: 1000 },
          { step: "guide.step2", ms: 1900 },
          { step: "guide.click2", ms: 900 },
          { step: "guide.done", ms: 3000 },
        ],
      },
      {
        id: "grasp",
        beats: [
          { step: "grasp.idle", ms: 2200 },
          { step: "grasp.hotkey", ms: 900 },
          { step: "grasp.reading", ms: 1100 },
          { step: "grasp.answer", ms: 1200 },
          { step: "grasp.hold", ms: 3400 },
        ],
      },
      {
        id: "reply",
        beats: [
          { step: "reply.idle", ms: 1500 },
          { step: "reply.hotkey", ms: 900 },
          { step: "reply.drafting", ms: 1100 },
          { step: "reply.draft", ms: typeMs(draft, 300) },
          { step: "reply.insert", ms: 1600 },
          { step: "reply.hold", ms: 3000 },
        ],
      },
    ];
  }, [t]);

  const [pos, setPos] = useState({ scene: 0, beat: 0 });
  // Once a scene is chosen it repeats instead of handing over to the next one.
  const [picked, setPicked] = useState(false);

  useEffect(() => {
    if (reduce || !inView) return;
    const beats = scenes[pos.scene].beats;
    const id = setTimeout(() => {
      setPos((prev) => {
        const last = prev.beat >= scenes[prev.scene].beats.length - 1;
        if (!last) return { scene: prev.scene, beat: prev.beat + 1 };
        return {
          scene: picked ? prev.scene : (prev.scene + 1) % scenes.length,
          beat: 0,
        };
      });
    }, beats[pos.beat].ms);
    return () => clearTimeout(id);
  }, [pos, picked, inView, reduce, scenes]);

  // With reduced motion the loop never runs: show the picked scene, answered.
  const beats = scenes[pos.scene].beats;
  const step: Step = reduce ? beats[beats.length - 1].step : beats[pos.beat].step;
  const scene = sceneOf(step);
  const stage: "app" | "chat" = scene === "read" || scene === "guide" ? "app" : "chat";
  const hotkeyActive = step.endsWith(".hotkey");
  // The panel is gone once the draft has been placed in the message box.
  const panelOpen =
    !step.endsWith(".idle") && !step.endsWith(".hotkey") && step !== "reply.hold";
  // Beats are numbered across the whole reel so a typing pass is never mistaken
  // for the same pass one loop earlier.
  const beatId = pos.scene * 100 + pos.beat;

  const monologue = t(`scenes.${scene}.monologue`);

  const reel = (
    <div
      ref={rootRef}
      className="grid grid-cols-1 items-center gap-10 text-left lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-12"
    >
      {/* left: the thought */}
      <div className="min-h-[150px] sm:min-h-[176px] lg:min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={monologue}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="text-balance text-[28px] font-semibold leading-[1.22] tracking-[-0.035em] text-ink sm:text-[36px] lg:text-[42px] lg:leading-[1.18]"
          >
            {monologue}
          </motion.p>
        </AnimatePresence>

        <div className="mt-7 flex items-center gap-2.5" aria-hidden="true">
          <motion.span
            animate={hotkeyActive && !reduce ? { y: [0, 3, 0, 3, 0] } : { y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`inline-flex h-9 items-center rounded-lg border px-3 font-mono text-[11px] transition-colors ${
              hotkeyActive ? "border-iris bg-iris/5 text-iris" : "border-edge bg-white text-slate"
            }`}
          >
            {t("hotkey")}
          </motion.span>
          <span
            className={`font-mono text-[11px] transition-colors ${
              hotkeyActive ? "text-iris" : "text-faint"
            }`}
          >
            {t("hotkeyTimes")}
          </span>
        </div>
      </div>

      {/* right: the screen, and the panel over it */}
      <div className="relative" aria-hidden="true">
        <div className="h-[352px] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_20px_rgba(16,17,20,0.07)] sm:h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex h-full flex-col"
            >
              {stage === "app" ? (
                <AppStage step={step} t={t} />
              ) : (
                <ChatStage step={step} beat={beatId} t={t} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 sm:absolute sm:bottom-5 sm:right-5 sm:mt-0 sm:w-[286px]">
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.38, ease: EASE }}
              >
                <Panel step={step} beat={beatId} t={t} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  const tabRow = showTabs ? (
    <div className="mt-8 flex flex-wrap justify-center gap-2.5 sm:mt-9">
      {tabs.map((label, i) => (
        <button
          key={label}
          type="button"
          aria-pressed={i === pos.scene}
          onClick={() => {
            setPicked(true);
            setPos({ scene: i, beat: 0 });
          }}
          className={`cursor-pointer rounded-full border px-[17px] py-[9px] text-[13px] font-medium transition-all duration-200 ${
            i === pos.scene
              ? "border-ink bg-ink text-white"
              : "border-line bg-white text-body hover:border-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  ) : null;

  if (!framed) {
    return (
      <>
        {reel}
        {tabRow}
      </>
    );
  }

  return (
    <div
      className="io-fade-up mt-12 w-full max-w-[1120px] rounded-3xl border border-line bg-paper p-4 pb-6 sm:mt-[72px] sm:p-8 lg:p-11 lg:pb-9"
      style={{ animationDelay: "0.4s", animationDuration: "0.7s" }}
    >
      {reel}
      {tabRow}
    </div>
  );
}

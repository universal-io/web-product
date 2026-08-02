"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";

// Fictional, looping product demo.
//
// Four scenes play in sequence, each one a thought the user has in front of a
// screen they don't understand, answered without leaving that screen:
//   read  — a notice on a web app gets explained
//   guide — a button that is hard to find gets pointed at
//   grasp — a roundabout chat message gets broken down
//   reply — a draft reply is waiting, and lands in the message box
//
// Every scene runs the same beats, so the reel reads as one repeated move
// rather than four different tricks:
//
//   enter → (spot) → think → linger → dim → hotkey → keyhold → work → hold → exit
//
// The window arrives, the thought is spoken, the screen goes back behind a
// scrim, the hotkey is pressed on top of it, and only then does the panel
// arrive — lit, with everything else held down. Held frames of 0.5s sit between
// the moving parts on purpose: without them the beats blur into one slide.
//
// Nothing here is interactive. Every surface is drawn from scratch with the
// site's own tokens; no screenshots, no real product code.

type Scene = "read" | "guide" | "grasp" | "reply";

type Phase =
  | "enter"
  | "spot"
  | "think"
  | "linger"
  | "dim"
  | "hotkey"
  | "keyhold"
  | "reading"
  | "answer"
  | "point"
  | "drafting"
  | "draft"
  | "insert"
  | "hold"
  | "exit";

type Step = `${Scene}.${Phase}`;

const sceneOf = (step: Step) => step.split(".")[0] as Scene;
const phaseOf = (step: Step) => step.split(".")[1] as Phase;

const TYPE_SPEED = 22;
/** Time a typing step needs: the characters themselves, plus a beat to read it. */
const typeMs = (text: string, pad = 900) => text.length * TYPE_SPEED + pad;
/** A held frame. Long enough to register as a stop, short enough not to drag. */
const BEAT = 550;

/** Per-character stagger and fade for the spoken line. Unhurried on purpose. */
const CHAR_STAGGER = 46;
const CHAR_FADE = 480;
const sayMs = (text: string, pad = 500) =>
  text.length * CHAR_STAGGER + CHAR_FADE + pad;

type Row = { k: string; v: string };
type Beat = { step: Step; ms: number };

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** How every window in the reel arrives and leaves. Taken from /vision. */
const windowMotion = {
  initial: { opacity: 0, scale: 0.94, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -12 },
  transition: { duration: 0.45, ease: EASE },
};

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: EASE },
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
      className="whitespace-pre-line text-[28px] font-semibold leading-[1.22] tracking-[-0.035em] text-white sm:text-[36px] lg:text-[42px] lg:leading-[1.18]"
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

  // "notice" lights the one thing the user is stuck on and drops everything
  // else back. From the hotkey onward the whole screen goes back and stays
  // there, so nothing competes with the keys and then with the panel.
  const spotlight =
    phase === "spot" || phase === "think" || phase === "linger"
      ? "notice"
      : phase === "enter"
        ? "none"
        : "all";

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
    phase === "draft" ? "typing" : phase === "insert" ? "done" : "off",
    beat,
  );

  const busy = phase === "reading" || phase === "drafting";
  const busyLabel = phase === "drafting" ? t("drafting") : t("reading");

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
                {phase === "draft" && <Caret />}
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
/* the reel                                                            */
/* ------------------------------------------------------------------ */

export default function StoryReel({
  framed = false,
  showTabs = false,
}: {
  /** Wrap the reel in the site's dark card, as used on the home page. */
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
    const say = (scene: Scene) => sayMs(t(`scenes.${scene}.monologue`));

    // Shared spine: the screen goes back, a held frame, the keys, another held
    // frame, and only then whatever this scene answers with.
    const press = (scene: Scene): Beat[] => [
      { step: `${scene}.dim`, ms: BEAT },
      { step: `${scene}.hotkey`, ms: 1600 },
      { step: `${scene}.keyhold`, ms: BEAT },
    ];

    return [
      {
        id: "read",
        beats: [
          { step: "read.enter", ms: 1300 },
          { step: "read.spot", ms: 1100 },
          { step: "read.think", ms: say("read") },
          { step: "read.linger", ms: 1800 },
          ...press("read"),
          { step: "read.reading", ms: 900 },
          { step: "read.answer", ms: typeMs(t("scenes.read.answer"), 300) },
          { step: "read.hold", ms: 2800 },
          { step: "read.exit", ms: 800 },
        ],
      },
      {
        id: "guide",
        beats: [
          { step: "guide.enter", ms: 1500 },
          { step: "guide.think", ms: say("guide") },
          { step: "guide.linger", ms: 1600 },
          ...press("guide"),
          { step: "guide.reading", ms: 900 },
          { step: "guide.answer", ms: typeMs(t("scenes.guide.answer"), 300) },
          { step: "guide.point", ms: 2600 },
          { step: "guide.hold", ms: 2000 },
          { step: "guide.exit", ms: 800 },
        ],
      },
      {
        id: "grasp",
        beats: [
          { step: "grasp.enter", ms: 1400 },
          { step: "grasp.think", ms: say("grasp") },
          { step: "grasp.linger", ms: 1600 },
          ...press("grasp"),
          { step: "grasp.reading", ms: 900 },
          { step: "grasp.answer", ms: 1400 },
          { step: "grasp.hold", ms: 2800 },
          { step: "grasp.exit", ms: 800 },
        ],
      },
      {
        id: "reply",
        beats: [
          { step: "reply.enter", ms: 1400 },
          { step: "reply.think", ms: say("reply") },
          { step: "reply.linger", ms: 1500 },
          ...press("reply"),
          { step: "reply.drafting", ms: 900 },
          { step: "reply.draft", ms: typeMs(t("scenes.reply.draft"), 300) },
          { step: "reply.insert", ms: 1800 },
          { step: "reply.hold", ms: 2400 },
          { step: "reply.exit", ms: 800 },
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

  // With reduced motion the loop never runs: show the scene at rest, answered,
  // which is the "hold" beat rather than the empty frame after it.
  const beats = scenes[pos.scene].beats;
  const restBeat = beats.findIndex((b) => phaseOf(b.step) === "hold");
  const step: Step = reduce ? beats[restBeat].step : beats[pos.beat].step;
  const scene = sceneOf(step);
  const phase = phaseOf(step);

  // The window is on screen for the whole scene except the frame that clears it.
  const windowOn = phase !== "exit";
  // From the hotkey onward the screen sits behind a scrim for the rest of the
  // scene, so the only lit thing left is the panel.
  const scrimOn =
    phase !== "enter" &&
    phase !== "spot" &&
    phase !== "think" &&
    phase !== "linger" &&
    phase !== "exit";
  const panelOpen =
    phase === "reading" ||
    phase === "drafting" ||
    phase === "answer" ||
    phase === "point" ||
    phase === "draft" ||
    phase === "insert" ||
    phase === "hold";
  // Beats are numbered across the whole reel so a typing pass is never mistaken
  // for the same pass one loop earlier.
  const beatId = pos.scene * 100 + pos.beat;

  const monologue = t(`scenes.${scene}.monologue`);
  // The thought lands a character at a time, and only after the screen has
  // already shown what the thought is about. On the way out it keeps its text
  // and fades with everything else.
  const monologueReveal: "hidden" | "reveal" | "shown" = reduce
    ? "shown"
    : phase === "enter" || phase === "spot"
      ? "hidden"
      : phase === "think"
        ? "reveal"
        : "shown";

  const reel = (
    <div
      ref={rootRef}
      className="grid grid-cols-1 items-center gap-10 text-left lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-12"
    >
      {/* left: the thought, and nothing else */}
      <motion.div
        animate={{ opacity: phase === "exit" ? 0 : 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex min-h-[132px] items-center sm:min-h-[164px] lg:min-h-[220px]"
      >
        {/* Keyed by scene so each new thought starts from its own hidden state
            rather than cross-fading with the previous one. */}
        <SpokenLine
          key={scene}
          text={monologue}
          reveal={monologueReveal}
          reduce={reduce}
        />
      </motion.div>

      {/* right: the screen, and the panel over it */}
      <div className="relative" aria-hidden="true">
        <div className="relative h-[352px] sm:h-[400px]">
          <AnimatePresence mode="wait">
            {windowOn && (
              <motion.div
                key={scene}
                initial={reduce ? false : windowMotion.initial}
                animate={windowMotion.animate}
                exit={windowMotion.exit}
                transition={windowMotion.transition}
                className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_20px_rgba(16,17,20,0.07)]"
              >
                {scene === "read" ? (
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
                      transition={{ duration: 0.35, ease: EASE }}
                      className="absolute inset-0 z-20 flex items-center justify-center bg-ink/50"
                    >
                      <AnimatePresence>
                        {phase === "hotkey" && (
                          <motion.div
                            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            // Held back so the screen is seen going dark first,
                            // and the keys read as a separate move.
                            transition={{ duration: 0.3, delay: 0.35, ease: EASE }}
                            className="flex items-center gap-3"
                          >
                            {/* Two unhurried presses, the way the key is hit. */}
                            <motion.span
                              animate={reduce ? { y: 0 } : { y: [0, 0, 5, 0, 5, 0] }}
                              transition={{
                                duration: 1.1,
                                delay: 0.75,
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
              ? "border-white bg-white text-ink"
              : "border-white/20 bg-white/5 text-white/70 hover:border-white/60 hover:text-white"
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
    // Dark on a white page: the reel reads as footage rather than as one more
    // block of the layout, which is what keeps the beats from blurring together.
    <div
      className="io-fade-up mt-12 w-full max-w-[1120px] rounded-3xl border border-white/10 bg-ink p-4 pb-6 sm:mt-[72px] sm:p-8 lg:p-11 lg:pb-9"
      style={{ animationDelay: "0.4s", animationDuration: "0.7s" }}
    >
      {reel}
      {tabRow}
    </div>
  );
}

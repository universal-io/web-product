"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";

// Fictional capture window: a Mac-native-feeling input field that pops up on a
// hotkey, receives a frustrated sentence, and gets reviewed/rewritten by the
// membrane. Pure staged animation — nothing here is interactive.

type Phase = "keys" | "window" | "typing" | "review" | "rewrite" | "done" | "out";

const WINDOW_PHASES: Phase[] = ["window", "typing", "review", "rewrite", "done"];
const REVIEW_PHASES: Phase[] = ["review", "rewrite", "done"];
const REWRITE_PHASES: Phase[] = ["rewrite", "done"];

function ArrowUpGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Keycap({
  children,
  wide = false,
  pressed = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
  pressed?: boolean;
}) {
  return (
    <motion.span
      animate={pressed ? { y: [0, 4, 0] } : { y: 0 }}
      transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
      className={`vision-glass inline-flex h-12 items-center justify-center rounded-xl text-[15px] font-semibold text-ink shadow-[0_4px_14px_rgba(140,70,50,0.14)] ${
        wide ? "px-6" : "w-12"
      }`}
    >
      {children}
    </motion.span>
  );
}

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="io-caret ml-[2px] inline-block h-[17px] w-[2px] translate-y-[3px] bg-ink"
    />
  );
}

export default function InputCapture() {
  const t = useTranslations("vision.capture");
  const raw = t("rawText");
  const rewrite = t("rewriteText");
  const chips = t.raw("chips") as string[];
  const shouldReduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });

  const [phase, setPhase] = useState<Phase>("keys");
  const [typedRaw, setTypedRaw] = useState(0);
  const [typedRewrite, setTypedRewrite] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || !inView) return;

    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    (async () => {
      while (!cancelled) {
        setPhase("keys");
        setTypedRaw(0);
        setTypedRewrite(0);
        await sleep(1400);
        if (cancelled) return;
        setPhase("window");
        await sleep(650);
        setPhase("typing");
        for (let i = 1; i <= raw.length; i++) {
          if (cancelled) return;
          setTypedRaw(i);
          await sleep(26);
        }
        await sleep(400);
        if (cancelled) return;
        setPhase("review");
        await sleep(1500);
        if (cancelled) return;
        setPhase("rewrite");
        for (let i = 1; i <= rewrite.length; i++) {
          if (cancelled) return;
          setTypedRewrite(i);
          await sleep(20);
        }
        setPhase("done");
        await sleep(3200);
        if (cancelled) return;
        setPhase("out");
        await sleep(550);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inView, shouldReduceMotion, raw, rewrite]);

  // With reduced motion the loop never runs — render the finished state.
  const effPhase: Phase = shouldReduceMotion ? "done" : phase;
  const shownRaw = shouldReduceMotion ? raw : raw.slice(0, typedRaw);
  const shownRewrite = shouldReduceMotion ? rewrite : rewrite.slice(0, typedRewrite);
  const isWindow = WINDOW_PHASES.includes(effPhase);
  const isReview = REVIEW_PHASES.includes(effPhase);
  const isRewrite = REWRITE_PHASES.includes(effPhase);

  return (
    <div
      ref={rootRef}
      className="relative flex min-h-[460px] w-full items-center justify-center"
    >
      <AnimatePresence mode="wait">
        {!isWindow ? (
          <motion.div
            key="keys"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-5"
          >
            <div className="flex items-center gap-2.5" aria-hidden="true">
              <Keycap pressed={effPhase === "keys"}>⌥</Keycap>
              <Keycap pressed={effPhase === "keys"} wide>
                space
              </Keycap>
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
              {t("hotkeyHint")}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="window"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[560px]"
          >
            <div className="vision-panel relative overflow-hidden rounded-[28px] border border-white/60 bg-white/55 p-6 backdrop-blur-2xl sm:p-7">
              {/* header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="size-2.5 rounded-full bg-coral" aria-hidden="true" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
                    {t("appName")}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-faint" aria-hidden="true">
                  ⌥ space
                </span>
              </div>

              {/* raw input */}
              <div className="mt-5 min-h-[84px] text-[17px] font-medium leading-relaxed text-ink">
                {shownRaw}
                {effPhase !== "done" && <Caret />}
              </div>

              {/* toolbar */}
              <div className="mt-1 flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2" aria-hidden="true">
                  {chips.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-white/70 bg-white/40 px-3 py-1.5 text-[12px] font-medium text-body"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <motion.span
                  aria-hidden="true"
                  animate={
                    effPhase === "done" && !shouldReduceMotion
                      ? { scale: [1, 1.1, 1] }
                      : { scale: 1 }
                  }
                  transition={
                    effPhase === "done" && !shouldReduceMotion
                      ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.2 }
                  }
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-white"
                >
                  <ArrowUpGlyph />
                </motion.span>
              </div>

              <div className="mt-5 h-px w-full bg-white/70" aria-hidden="true" />

              {/* membrane review area — fixed height so the window never jumps */}
              <div className="mt-5 flex min-h-[150px] flex-col items-start gap-3.5">
                <AnimatePresence>
                  {isReview && (
                    <motion.div
                      key="tone"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center gap-2.5"
                    >
                      {effPhase === "review" ? (
                        <>
                          <span
                            className="vision-breathe size-2 rounded-full bg-iris"
                            aria-hidden="true"
                          />
                          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">
                            {t("reading")}
                          </span>
                        </>
                      ) : (
                        <motion.span
                          initial={shouldReduceMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-coral"
                        >
                          <span
                            className="size-1.5 rounded-full bg-coral"
                            aria-hidden="true"
                          />
                          {t("toneChip")}
                        </motion.span>
                      )}
                    </motion.div>
                  )}
                  {isRewrite && (
                    <motion.div
                      key="rewrite"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-iris">
                        {t("rewriteLabel")}
                      </div>
                      <div className="mt-2 text-[15px] leading-relaxed text-ink">
                        {shownRewrite}
                        {effPhase === "rewrite" && <Caret />}
                      </div>
                      <motion.div
                        initial={false}
                        animate={{ opacity: effPhase === "done" ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 flex items-center gap-2 font-mono text-[11px] text-slate"
                      >
                        <kbd className="rounded-md border border-white/70 bg-white/50 px-1.5 py-0.5 text-[10px]">
                          ⏎
                        </kbd>
                        {t("replaceHint")}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

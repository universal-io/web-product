"use client";

import { useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";

const VOICE_BAR_HEIGHTS = [
  40, 65, 30, 80, 55, 90, 45, 70, 35, 60, 85, 50, 75, 40, 65, 30, 55, 95, 60, 45,
];

function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 11L11 2M11 2H4M11 2V9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VoiceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="vision-subcard">
      <div className="flex h-14 items-end gap-[3px]" aria-hidden="true">
        {VOICE_BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className="vision-voice-bar block w-full rounded-full bg-gradient-to-t from-coral to-[var(--color-blush)]"
            style={{ height: `${h}%`, animationDelay: `${i * 65}ms` }}
          />
        ))}
      </div>
      <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-slate">
        <span className="text-ink">{label}</span> — {value}
      </div>
    </div>
  );
}

function ToneCard({ label, value }: { label: string; value: string }) {
  const gradientId = useId();
  const r = 24;
  const circumference = 2 * Math.PI * r;
  const progress = 0.72;

  return (
    <div className="vision-subcard flex items-center gap-4">
      <div className="vision-breathe relative h-[60px] w-[60px] shrink-0" aria-hidden="true">
        <svg viewBox="0 0 60 60" className="h-[60px] w-[60px] -rotate-90">
          <circle
            cx="30"
            cy="30"
            r={r}
            fill="none"
            stroke="var(--color-blush)"
            strokeOpacity="0.4"
            strokeWidth="6"
          />
          <circle
            cx="30"
            cy="30"
            r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="var(--color-blush-deep)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate">
        <div className="text-ink">{label}</div>
        <div>{value}</div>
      </div>
    </div>
  );
}

function EnergyCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  const r = 22;
  const arcLength = Math.PI * r;
  const progress = 0.34;

  return (
    <div className="vision-subcard">
      <div
        className="vision-breathe h-9 w-[68px]"
        aria-hidden="true"
        style={{ animationDelay: "1.5s" }}
      >
        <svg viewBox="0 0 68 38" className="h-9 w-[68px] overflow-visible">
          <path
            d="M12 34 A22 22 0 0 1 56 34"
            fill="none"
            stroke="var(--color-blush-deep)"
            strokeOpacity="0.9"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M12 34 A22 22 0 0 1 56 34"
            fill="none"
            stroke="#FF6B6B"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={arcLength * (1 - progress)}
          />
        </svg>
      </div>
      <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em]">
        <div className="text-ink">
          {label} {value}
        </div>
        <div className="mt-0.5 text-slate">{note}</div>
      </div>
    </div>
  );
}

function SpeakersCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="vision-subcard">
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-iris" />
        <span className="dash-h h-px flex-1" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-coral" />
      </div>
      <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em]">
        <div className="text-ink">{label}</div>
        <div className="mt-0.5 text-slate">{value}</div>
      </div>
    </div>
  );
}

function RewriteRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="vision-subcard sm:col-span-2">
      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-iris">
        {label}
      </div>
      <div className="mt-2 text-[15px] leading-relaxed text-ink">
        <span className="vision-typing inline-block">{text}</span>
        <span
          aria-hidden="true"
          className="io-caret ml-[2px] inline-block h-[16px] w-[2px] translate-y-[3px] bg-ink"
        />
      </div>
    </div>
  );
}

function GuideModeCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="relative mt-3 overflow-hidden rounded-[20px] bg-ink px-6 py-6 sm:px-7 sm:py-7">
      {/* liquid-chrome texture melted into the card as a soft light shimmer:
          screen blend keeps only the bright ripples, the mask fades it toward the text */}
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen"
        style={{
          WebkitMaskImage:
            "radial-gradient(55% 160% at 94% 50%, black 15%, transparent 68%)",
          maskImage:
            "radial-gradient(55% 160% at 94% 50%, black 15%, transparent 68%)",
          filter: "blur(2px) brightness(1.15)",
        }}
        src="/vision/membrane.mp4"
        poster="/vision/membrane-poster.webp"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[17px] font-semibold text-white">{title}</div>
          <p className="mt-1 max-w-[320px] text-[14px] leading-snug text-white/70">
            {body}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="io-ring-white flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 text-white"
        >
          <ArrowGlyph />
        </span>
      </div>
    </div>
  );
}

export default function MembranePanel() {
  const t = useTranslations("vision.panel");
  const tGuide = useTranslations("vision.guide");
  const shouldReduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = panelRef.current;
    if (!el || rafRef.current !== null) return;
    const { clientX, clientY } = e;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const rect = el.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--vision-mx", `${x}%`);
      el.style.setProperty("--vision-my", `${y}%`);
    });
  };

  const onPointerLeave = () => {
    panelRef.current?.style.setProperty("--vision-mx", "50%");
    panelRef.current?.style.setProperty("--vision-my", "50%");
  };

  return (
    <motion.div
      id="membrane"
      ref={panelRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.98 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="vision-panel relative scroll-mt-28 overflow-hidden rounded-[32px] border border-white/60 p-5 sm:p-7"
    >
      {/* progressive blur layers — each masked so blur strength varies across the panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          backdropFilter: "blur(10px) saturate(140%)",
          WebkitBackdropFilter: "blur(10px) saturate(140%)",
          background: "rgba(255,255,255,0.12)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          background: "rgba(255,255,255,0.08)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          backdropFilter: "blur(44px)",
          WebkitBackdropFilter: "blur(44px)",
          background: "rgba(255,255,255,0.06)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 25% 15%, black 0%, transparent 65%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 25% 15%, black 0%, transparent 65%)",
        }}
      />
      <div aria-hidden="true" className="vision-noise pointer-events-none absolute inset-0 rounded-[32px]" />
      <div aria-hidden="true" className="vision-spotlight pointer-events-none absolute inset-0 rounded-[32px]" />

      <div className="relative">
        <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
          {t("label")}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <VoiceCard label={t("voice.label")} value={t("voice.value")} />
          <ToneCard label={t("tone.label")} value={t("tone.value")} />
          <EnergyCard
            label={t("energy.label")}
            value={t("energy.value")}
            note={t("energy.note")}
          />
          <SpeakersCard label={t("speakers.label")} value={t("speakers.value")} />
          <RewriteRow label={t("rewriteLabel")} text={t("rewriteText")} />
        </div>
        <GuideModeCard title={tGuide("title")} body={tGuide("body")} />
      </div>
    </motion.div>
  );
}

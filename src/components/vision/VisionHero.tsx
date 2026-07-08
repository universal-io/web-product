"use client";

import { getImageProps } from "next/image";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MembranePanel from "./MembranePanel";

function ArrowGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
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

function ArrowPill({
  href,
  variant = "solid",
  children,
}: {
  href: string;
  variant?: "solid" | "glass";
  children: React.ReactNode;
}) {
  const isSolid = variant === "solid";
  return (
    <a
      href={href}
      className={`group relative inline-flex items-center overflow-hidden rounded-full py-3.5 pl-7 pr-[3.75rem] text-[15px] font-semibold transition-colors ${
        isSolid
          ? "bg-ink text-white hover:bg-[#242630]"
          : "vision-glass text-ink hover:bg-white/70"
      }`}
    >
      {children}
      <span
        aria-hidden="true"
        className={`absolute bottom-1 right-1 top-1 flex aspect-square items-center justify-center rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 ${
          isSolid ? "bg-white text-ink" : "bg-ink text-white"
        }`}
      >
        <ArrowGlyph />
      </span>
    </a>
  );
}

export default function VisionHero() {
  const t = useTranslations("vision");
  const tNav = useTranslations("vision.nav");
  const shouldReduceMotion = useReducedMotion();

  const common = { alt: "", sizes: "100vw" };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...common,
    src: "/vision/hero-bg.webp",
    width: 2560,
    height: 1440,
  });
  const {
    props: { srcSet: portraitSrcSet, ...portraitRest },
  } = getImageProps({
    ...common,
    src: "/vision/hero-bg-portrait.webp",
    width: 1080,
    height: 1921,
  });

  const fadeUp = (delay: number) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-[#fff7f4] text-ink">
      {/* background image — art-directed: only one of the two crops downloads, per viewport */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <picture>
          <source media="(min-width: 640px)" srcSet={desktopSrcSet} />
          <img
            {...portraitRest}
            srcSet={portraitSrcSet}
            alt=""
            fetchPriority="high"
            className="vision-kenburns absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        {/* text-contrast veil: strong on the left column only, so the marble
            breathes on the right; on small screens the copy sits at the top,
            so the veil runs vertically instead */}
        <div className="absolute inset-0 hidden bg-[linear-gradient(100deg,rgba(255,250,248,0.88)_0%,rgba(255,250,248,0.68)_28%,rgba(255,250,248,0.26)_46%,rgba(255,250,248,0.04)_62%,rgba(255,250,248,0)_75%)] sm:block" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,248,0.9)_0%,rgba(255,250,248,0.72)_34%,rgba(255,250,248,0.3)_55%,rgba(255,250,248,0.05)_75%)] sm:hidden" />
        {/* soft glowing orbs drifting through the scene */}
        <div
          className="vision-orb h-[340px] w-[340px] opacity-70"
          style={{
            top: "6%",
            right: "12%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,216,206,0.55) 55%, transparent 75%)",
          }}
        />
        <div
          className="vision-orb h-[260px] w-[260px] opacity-60"
          style={{
            bottom: "4%",
            left: "36%",
            animationDelay: "-9s",
            animationDuration: "30s",
            background:
              "radial-gradient(circle, rgba(255,240,235,0.9) 0%, rgba(244,168,154,0.45) 55%, transparent 75%)",
          }}
        />
        <div
          className="vision-orb h-[190px] w-[190px] opacity-50"
          style={{
            top: "32%",
            left: "5%",
            animationDelay: "-18s",
            animationDuration: "22s",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,190,175,0.4) 55%, transparent 75%)",
          }}
        />
      </div>

      {/* floating nav */}
      <header className="fixed inset-x-0 top-5 z-50 flex justify-center px-5">
        <div className="vision-glass flex w-full max-w-[1120px] items-center justify-between rounded-full px-5 py-3 shadow-[0_8px_30px_rgba(101,60,50,0.08)]">
          <span className="text-[19px] font-bold tracking-[-0.02em] text-ink">
            I<span className="io-scan">{"//"}</span>O
          </span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a
              href="mailto:hello@universal-io.com"
              className="whitespace-nowrap rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#242630]"
            >
              {tNav("cta")}
            </a>
          </div>
        </div>
      </header>

      {/* content */}
      <main className="relative z-10 mx-auto flex min-h-dvh max-w-[1360px] flex-col justify-center gap-14 px-6 pb-20 pt-32 sm:px-12 lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-20 lg:pt-28">
        <div className="flex flex-col items-start text-left">
          <motion.div
            {...fadeUp(0)}
            className="rounded-full border border-white/60 bg-white/40 px-4 py-[7px] font-mono text-xs uppercase tracking-[0.14em] text-body backdrop-blur-sm"
          >
            {t("eyebrow")}
          </motion.div>
          <motion.h1
            {...fadeUp(0.08)}
            className="mt-8 max-w-[680px] break-keep text-balance text-[40px] font-semibold leading-[1.07] tracking-[-0.035em] sm:text-[58px] lg:text-[78px] lg:leading-[1.03] lg:tracking-[-0.04em]"
          >
            {t("title")}
          </motion.h1>
          <motion.p
            {...fadeUp(0.16)}
            className="mt-7 max-w-[500px] text-pretty text-[16px] leading-[1.7] text-body sm:text-[18px]"
          >
            {t("subtitle")}
          </motion.p>
          <motion.div
            {...fadeUp(0.24)}
            className="mt-10 flex w-full flex-col items-stretch gap-3.5 sm:w-auto sm:flex-row sm:items-center"
          >
            <ArrowPill href="mailto:hello@universal-io.com">
              {t("ctaPrimary")}
            </ArrowPill>
            <ArrowPill href="#membrane" variant="glass">
              {t("ctaSecondary")}
            </ArrowPill>
          </motion.div>
        </div>

        <MembranePanel />
      </main>
    </div>
  );
}

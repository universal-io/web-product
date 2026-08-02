"use client";

import { useTranslations } from "next-intl";

// Vision-route footer. Quiet Silicon Valley tone: no loud elements, just
// carefully built details — status dot, mono microcopy, link columns, and an
// oversized watermark clipped by the page edge. All links are placeholders.

type FooterColumn = { title: string; links: string[] };

function ArrowUpRight() {
  return (
    <svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true">
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

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452z" />
    </svg>
  );
}

export default function VisionFooter() {
  const t = useTranslations("vision.footer");
  const columns = t.raw("columns") as FooterColumn[];

  const socials = [
    { label: t("social.x"), icon: <XIcon /> },
    { label: t("social.github"), icon: <GitHubIcon /> },
    { label: t("social.linkedin"), icon: <LinkedInIcon /> },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-ink/10 bg-[#fff7f4]">
      <div className="relative z-10 mx-auto w-full max-w-[1360px] px-6 pt-16 sm:px-12 sm:pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1.6fr] lg:gap-24">
          {/* brand block */}
          <div className="flex flex-col items-start">
            <span className="text-[22px] font-bold tracking-[-0.02em] text-ink">
              I<span className="io-scan">{"//"}</span>O
            </span>
            <p className="mt-5 max-w-[320px] text-pretty text-[15px] leading-[1.7] text-body">
              {t("tagline")}
            </p>
            <a
              href="mailto:hello@universal-io.com"
              className="group mt-7 inline-flex items-center gap-2 border-b border-ink/20 pb-1 text-[14px] font-medium text-ink transition-colors hover:border-ink"
            >
              hello@universal-io.com
              <span className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                <ArrowUpRight />
              </span>
            </a>
            <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-white/60 px-3.5 py-2">
              <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">
                {t("status")}
              </span>
            </div>
          </div>

          {/* link columns */}
          <nav
            className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4"
            aria-label="Footer"
          >
            {columns.map((col) => (
              <div key={col.title}>
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
                  {col.title}
                </div>
                <ul className="mt-5 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[14px] text-body transition-colors hover:text-ink"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* bottom bar */}
        <div className="mt-16 flex flex-col-reverse gap-6 border-t border-ink/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.04em] text-faint">
            <span>{t("copyright")}</span>
            <span aria-hidden="true">·</span>
            <span>{t("note")}</span>
          </div>
          <div className="flex items-center gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex size-9 items-center justify-center rounded-full border border-ink/10 bg-white/60 text-body transition-colors hover:border-ink/30 hover:text-ink"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* oversized watermark, clipped by the footer's bottom edge */}
      <div aria-hidden="true" className="pointer-events-none mt-8 select-none">
        <div className="mx-auto w-full max-w-[1360px] px-6 sm:px-12">
          <div className="translate-y-[24%] whitespace-nowrap text-[clamp(64px,10.5vw,150px)] font-semibold leading-[0.9] tracking-[-0.045em] text-ink/[0.05]">
            Universal I/O
          </div>
        </div>
      </div>
    </footer>
  );
}

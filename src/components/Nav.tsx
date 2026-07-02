"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

const links = [
  { href: "/#product", key: "product", mono: false },
  { href: "/#use-cases", key: "useCases", mono: false },
  { href: "/#principles", key: "principles", mono: false },
  { href: "/#io", key: "io", mono: true },
] as const;

export default function Nav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mq = window.matchMedia("(min-width: 768px)");
    const onMq = () => {
      if (mq.matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-hair bg-white/85 px-5 py-3.5 backdrop-blur-xl sm:px-10 sm:py-[18px]">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-baseline gap-2.5 text-ink"
        >
          <span className="text-[19px] font-bold tracking-[-0.02em]">
            I<span className="text-iris">{"//"}</span>O
          </span>
          <span className="hidden text-[13px] font-medium tracking-[0.01em] text-slate min-[420px]:inline">
            Universal I/O
          </span>
        </Link>

        {/* desktop */}
        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={`text-sm font-medium text-body transition-colors hover:text-ink ${
                l.mono ? "font-mono" : ""
              }`}
            >
              {t(l.key)}
            </Link>
          ))}
          <LanguageSwitcher />
          <Link
            href="/#access"
            className="rounded-[10px] bg-ink px-[18px] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-iris"
          >
            {t("cta")}
          </Link>
        </div>

        {/* mobile */}
        <div className="flex items-center gap-2.5 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            className="relative flex h-10 w-10 items-center justify-center rounded-[10px] border border-line bg-white transition-colors active:bg-paper"
          >
            <span
              className={`absolute h-[1.6px] w-[18px] rounded-full bg-ink transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "rotate-45" : "-translate-y-[5px]"
              }`}
            />
            <span
              className={`absolute h-[1.6px] w-[18px] rounded-full bg-ink transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "-rotate-45" : "translate-y-[5px]"
              }`}
            />
          </button>
        </div>
      </nav>

      {/* mobile overlay menu */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-40 md:hidden ${
          open ? "visible" : "invisible"
        } transition-[visibility] duration-500`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-white/90 backdrop-blur-2xl transition-opacity duration-400 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="relative flex h-full flex-col overflow-y-auto px-6 pb-10 pt-[92px]">
          <div className="flex flex-col">
            {links.map((l, i) => (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${90 + i * 55}ms` : "0ms" }}
                className={`flex items-center justify-between border-b border-hair py-[18px] text-[26px] font-semibold tracking-[-0.02em] text-ink transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  l.mono ? "font-mono" : ""
                } ${open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              >
                {t(l.key)}
                <span className="font-mono text-sm text-ghost">{"//"}</span>
              </Link>
            ))}
          </div>
          <div
            style={{ transitionDelay: open ? "340ms" : "0ms" }}
            className={`mt-auto flex flex-col gap-4 pt-10 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <Link
              href="/#access"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-ink px-7 py-4 text-center text-base font-semibold text-white transition-colors active:bg-iris"
            >
              {t("cta")}
            </Link>
            <div className="text-center font-mono text-xs tracking-[0.06em] text-faint">
              macOS · iOS · universal-io.com
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

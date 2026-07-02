"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { routing, localeNames, type Locale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const switchTo = (next: Locale) => {
    setOpen(false);
    router.replace(pathname, { locale: next });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={t("language")}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-[7px] font-mono text-xs uppercase tracking-[0.08em] text-body transition-colors hover:border-ink hover:text-ink"
      >
        {locale}
        <svg
          width="9"
          height="6"
          viewBox="0 0 9 6"
          fill="none"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1l3.5 3.5L8 1"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className={`absolute right-0 top-[calc(100%+8px)] min-w-[148px] origin-top-right overflow-hidden rounded-xl border border-line bg-white py-1 shadow-[0_10px_30px_rgba(16,17,20,0.10)] transition-[opacity,transform] duration-200 ${
          open
            ? "visible scale-100 opacity-100"
            : "invisible scale-95 opacity-0"
        }`}
      >
        {routing.locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => switchTo(l)}
            className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-sm transition-colors ${
              l === locale
                ? "font-semibold text-ink"
                : "text-body hover:bg-paper hover:text-ink"
            }`}
          >
            {localeNames[l]}
            {l === locale && (
              <span className="font-mono text-xs text-iris">{"//"}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

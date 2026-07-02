"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Reveal from "./Reveal";

export default function Cta() {
  const t = useTranslations("cta");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: connect to a real endpoint (e.g. Supabase / Resend / form service)
    setSent(true);
  };

  return (
    <section id="access" className="scroll-mt-16 border-t border-hair bg-paper">
      <Reveal className="mx-auto flex max-w-[760px] flex-col items-center px-5 py-[88px] text-center sm:px-10 sm:py-[130px]">
        <span className="text-4xl font-semibold tracking-[-0.02em]">
          I<span className="io-scan">{"//"}</span>O
        </span>
        <h2 className="mt-7 text-balance text-[34px] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[44px] lg:text-[52px] lg:leading-[1.08]">
          {t("title")}
        </h2>
        <p className="mt-[22px] max-w-[540px] text-base leading-[1.65] text-body sm:text-lg">
          {t("body")}
        </p>

        {sent ? (
          <div className="mt-9 flex items-center gap-2.5 rounded-xl border border-line bg-white px-6 py-4 text-[15px] font-medium text-ink shadow-[0_1px_2px_rgba(16,17,20,0.04)]">
            <span className="h-2 w-2 rounded-full bg-cyan" />
            {t("success")}
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="mt-9 flex w-full max-w-[480px] flex-col gap-2.5 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("placeholder")}
              aria-label={t("placeholder")}
              className="flex-1 rounded-xl border border-edge bg-white px-[18px] py-[15px] text-[15px] text-ink outline-none transition-colors placeholder:text-faint focus:border-iris"
            />
            <button
              type="submit"
              className="cursor-pointer whitespace-nowrap rounded-xl bg-ink px-[26px] py-[15px] text-[15px] font-semibold text-white transition-colors hover:bg-iris"
            >
              {t("button")}
            </button>
          </form>
        )}

        <p className="mt-6 font-mono text-[13px] text-faint">{t("witty")}</p>
      </Reveal>
    </section>
  );
}

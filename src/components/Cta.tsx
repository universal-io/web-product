import { useTranslations } from "next-intl";
import Reveal from "./Reveal";
import { MACOS_DOWNLOAD_URL } from "@/lib/download";
import { Link } from "@/i18n/navigation";

// The closing section used to collect an email address for early access. That
// form was never wired to anything — it set a success flag locally and dropped
// what was typed, so it told people they were on a list that did not exist. The
// product is downloadable now, so the ask is the download, and anyone who wants
// the paid plan continues from the pricing page, which is the only place that
// knows how to start Checkout.
//
// No longer a client component: with the form gone there is no state here.

export default function Cta() {
  const t = useTranslations("cta");

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

        <div className="mt-9 flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <a
            href={MACOS_DOWNLOAD_URL}
            className="whitespace-nowrap rounded-xl bg-ink px-[26px] py-[15px] text-[15px] font-semibold text-white transition-colors hover:bg-iris"
          >
            {t("button")}
          </a>
          <Link
            href="/pricing"
            className="text-[15px] font-semibold text-iris transition-colors hover:text-iris-deep"
          >
            {t("secondary")}
          </Link>
        </div>

        <p className="mt-6 font-mono text-[13px] text-faint">{t("witty")}</p>
      </Reveal>
    </section>
  );
}

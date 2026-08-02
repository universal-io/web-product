import { useTranslations } from "next-intl";
import MeshHeadline from "@/components/MeshHeadline";
import StoryReel from "@/components/StoryReel";
import { Link } from "@/i18n/navigation";
import { MACOS_DOWNLOAD_URL } from "@/lib/download";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      id="top"
      className="flex flex-col items-center px-5 pb-16 pt-14 text-center sm:px-10 sm:pb-24 sm:pt-[104px]"
    >
      <div className="io-fade-up rounded-full border border-line px-4 py-[7px] font-mono text-xs uppercase tracking-[0.12em] text-slate">
        {t("badge")}
      </div>
      {/* Line breaks are authored in the message, so the headline reads the
          same way at every width instead of being rebalanced by the browser. */}
      <div className="io-fade-up mt-8" style={{ animationDelay: "0.08s" }}>
        <MeshHeadline
          text={t("title")}
          className="max-w-[900px] text-[38px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[56px] sm:leading-[1.05] lg:text-[76px] lg:leading-[1.04]"
        />
      </div>
      <p
        className="io-fade-up mt-6 max-w-[640px] text-pretty text-[17px] leading-[1.6] text-body sm:text-xl"
        style={{ animationDelay: "0.16s" }}
      >
        {t("subtitle")}
      </p>
      <div
        className="io-fade-up mt-9 flex w-full max-w-[420px] flex-col items-stretch gap-3.5 sm:w-auto sm:max-w-none sm:flex-row sm:items-center"
        style={{ animationDelay: "0.24s" }}
      >
        <a
          href={MACOS_DOWNLOAD_URL}
          className="rounded-xl bg-ink px-7 py-[15px] text-base font-semibold text-white transition-colors hover:bg-iris"
        >
          {t("ctaPrimary")}
        </a>
        {/* The demo it used to scroll to now lives on /product. */}
        <Link
          href="/product#demo"
          className="rounded-xl border border-edge bg-white px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink"
        >
          {t("ctaSecondary")}
        </Link>
      </div>
      <div
        className="io-fade-up mt-[22px] font-mono text-xs tracking-[0.04em] text-faint"
        style={{ animationDelay: "0.3s" }}
      >
        {t("platforms")}
      </div>

      <StoryReel framed showTabs />
    </section>
  );
}

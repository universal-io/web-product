import { useTranslations } from "next-intl";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

export default function SymbolSystem() {
  const t = useTranslations("symbol");

  return (
    <section id="io" className="scroll-mt-16 bg-ink">
      <div className="mx-auto max-w-[1120px] px-5 py-[80px] sm:px-10 sm:py-[120px]">
        <SectionHeader
          kicker={t("kicker")}
          title={t("title")}
          body={t("body")}
          dark
        />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-3">
          <Reveal className="rounded-[20px] border border-carbon p-8 sm:px-8 sm:py-10">
            <div className="flex h-[96px] items-center gap-2">
              <span className="text-[64px] font-semibold leading-none text-white sm:text-[80px]">
                I
              </span>
              <span className="io-caret h-[50px] w-1 rounded-[2px] bg-iris sm:h-[62px]" />
            </div>
            <h3 className="mb-2 mt-6 text-lg font-semibold text-white">
              {t("input.title")}
            </h3>
            <p className="text-[15px] leading-relaxed text-faint">
              {t("input.body")}
            </p>
          </Reveal>

          <Reveal
            delay={100}
            className="rounded-[20px] border border-carbon p-8 sm:px-8 sm:py-10"
          >
            <div className="flex h-[96px] items-center">
              <span className="io-scan text-[64px] font-semibold leading-none sm:text-[80px]">
                {"//"}
              </span>
            </div>
            <h3 className="mb-2 mt-6 text-lg font-semibold text-white">
              {t("translation.title")}
            </h3>
            <p className="text-[15px] leading-relaxed text-faint">
              {t("translation.body")}
            </p>
          </Reveal>

          <Reveal
            delay={200}
            className="rounded-[20px] border border-carbon p-8 sm:px-8 sm:py-10"
          >
            <div className="flex h-[96px] items-center">
              <span className="io-ring-white h-[60px] w-[60px] rounded-full border-[6px] border-white sm:h-[72px] sm:w-[72px] sm:border-[7px]" />
            </div>
            <h3 className="mb-2 mt-6 text-lg font-semibold text-white">
              {t("output.title")}
            </h3>
            <p className="text-[15px] leading-relaxed text-faint">
              {t("output.body")}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
